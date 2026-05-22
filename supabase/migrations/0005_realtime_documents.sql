-- Enable Realtime on documents so the UI can subscribe to status changes.
ALTER TABLE documents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
