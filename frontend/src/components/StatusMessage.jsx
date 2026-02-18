export default function StatusMessage({ error, success }) {
  if (!error && !success) return null;

  return (
    <div className={`status-message ${error ? 'status-error' : 'status-success'}`}>
      {error || success}
    </div>
  );
}