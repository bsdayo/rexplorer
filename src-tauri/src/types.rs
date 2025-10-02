use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Tauri error: {0}")]
    Tauri(#[from] tauri::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Recv error: {0}")]
    Recv(#[from] tokio::sync::oneshot::error::RecvError),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

#[derive(Serialize, Clone)]
pub struct RcloneInfo {
    pub addr: String,
    pub user: String,
    pub pass: String,
}
