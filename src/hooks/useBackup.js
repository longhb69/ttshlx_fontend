import { useState, useEffect } from 'react';

export function useBackup(key, initialData) {
    const [data, setData] = useState(initialData);
    const [lastSaved, setLastSaved] = useState(null);
    
    
}