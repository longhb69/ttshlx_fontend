export default function formatFirebaseTimestamp(timestampInSeconds) {
    const date = new Date(timestampInSeconds * 1000);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
