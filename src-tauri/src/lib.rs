use std::sync::Mutex;

use std::process::Child;

use tauri::RunEvent;

use crate::types::RcloneInfo;

mod commands;
mod types;

pub(crate) static RCLONE_PROCESS: Mutex<Option<(RcloneInfo, Child)>> = Mutex::new(None);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::start_rclone_rcd])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| match event {
            RunEvent::Exit => {
                log::debug!("exiting, killing rclone process if exists");
                if let Some((_, mut process)) = RCLONE_PROCESS.lock().unwrap().take() {
                    process.kill().expect("failed to kill rclone process");
                }
            }
            _ => {}
        });
}
