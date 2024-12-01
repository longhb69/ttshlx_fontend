import { Timestamp } from "firebase/firestore";

export default function formatFirebaseTimestampV2(firebaseTimestamp) {
    if (!(firebaseTimestamp instanceof Timestamp)) {
        throw new Error("Invalid Firebase Timestamp");
    }

    const date = firebaseTimestamp.toDate(); // Convert Timestamp to JavaScript Date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits for month
    const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits for day
    return `${year}-${month}-${day}`;
}
