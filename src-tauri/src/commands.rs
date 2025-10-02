use std::io::{BufRead, BufReader};
use std::ops::Deref;
use std::process::{Command, Stdio};
use std::thread;
use tokio::sync::oneshot;
use uuid::Uuid;

use crate::types::*;

#[tauri::command]
pub async fn start_rclone_rcd() -> Result<RcloneInfo, Error> {
    let (tx, rx) = oneshot::channel::<RcloneInfo>();

    {
        // lock mutex
        let mut rclone = crate::RCLONE_PROCESS.lock().unwrap();

        if let Some((info, _)) = rclone.deref() {
            log::debug!("rclone process already running");
            return Ok(info.clone());
        }

        let addr = String::from("127.0.0.1:5582");
        let user = String::from("rexplorer");
        let pass = Uuid::new_v4().to_string();
        let info = RcloneInfo { addr, user, pass };

        log::debug!("rclone process not running, spawning new one");
        let mut process = Command::new("rclone")
            .args([
                "rcd",
                "--rc-addr",
                &info.addr,
                "--rc-user",
                &info.user,
                "--rc-pass",
                &info.pass,
            ])
            .stderr(Stdio::piped())
            .spawn()?;

        if let Some(stderr) = process.stderr.take() {
            // spawn a new thread to read stderr
            let info = info.clone();
            thread::spawn(move || {
                let reader = BufReader::new(stderr);
                let mut lines = reader.lines();
                let mut tx = Some(tx);
                let mut info = Some(info);
                while let Some(line) = lines.next() {
                    let line = line?;
                    log::debug!("rclone log: {}", line);
                    if line.contains("Serving remote control on")
                        && let Some(tx) = tx.take()
                        && let Some(info) = info.take()
                    {
                        let _ = tx.send(info);
                    }
                }

                Ok::<(), Error>(())
            });
        }

        *rclone = Some((info.clone(), process));
    }

    let info = rx.await?;

    Ok(info)
}
