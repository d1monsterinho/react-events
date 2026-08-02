import {QueryClient} from "@tanstack/react-query";

export const queryClient = new QueryClient();

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

export async function fetchEventImages({signal}) {
    const response = await fetch('http://localhost:3000/events/images', {signal});

    if (!response.ok) {
        const error = new Error();
        error.status = response.status;
        error.info = await response.json();

        throw error;
    }

    const { images } = await response.json();

    return images;
}

export async function fetchEventData({signal, id}) {
    const response = await fetch(`http://localhost:3000/events/${id}`, {signal});

    if (!response.ok) {
        const error = new Error();
        error.status = response.status;
        error.info = await response.json();

        throw error;
    }

    const {event} = await response.json();

    return event;
}

export async function createNewEvent(event) {
    const response = await fetch('http://localhost:3000/events', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = new Error();
        error.status = response.status;
        error.info = await response.json();

        throw error;
    }

    const {createdEvent} = await response.json();

    return createdEvent;
}

export async function deleteEvent({id}) {
    const response = await fetch(`http://localhost:3000/events/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = new Error('An error occurred while deleting the event');
        error.code = response.status;
        error.info = await response.json();
        throw error;
    }

    return response.json();
}