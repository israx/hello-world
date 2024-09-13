export async function fetchComments(url?: string): Promise<any[]> {
    if (!url)return [];
    
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched data:', data);
    return data;
}

