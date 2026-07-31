export async function fetchEvents({signal, searchValue}) {
    let url = 'http://localhost:3000/events';

    if (searchValue) {
        url += `?search=${searchValue}`;
    }

    const response = await fetch(url, {
        signal,
    });

    if (!response.ok) {
        const error = new Error('An error occurred while fetching the events');
        error.code = response.status;
        error.info = await response.json();
        throw error;
    }

    const { events } = await response.json();

    return events;
}