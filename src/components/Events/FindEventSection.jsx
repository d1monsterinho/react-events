import {useState} from 'react';
import {useQuery} from "@tanstack/react-query";
import {fetchEvents} from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";

export default function FindEventSection() {
    const [searchValue, setSearchValue] = useState();

    const {data, isLoading, isError, error} = useQuery({
        queryKey: ['events', {search: searchValue}],
        queryFn: ({signal, queryKey}) => fetchEvents({signal, ...queryKey[1]}),
        staleTime: 1000 * 60 * 3,
        enabled: searchValue !== undefined,
    });

    function handleSubmit(event) {
        event.preventDefault();
    }

    function handleChange(event) {
        setSearchValue(event.target.value);
    }

    let content;

    if (isLoading) {
        content = (
            <LoadingIndicator/>
        );
    }

    if (isError) {
        content = (
            <ErrorBlock title="Error occurred!" message={error.info?.message || 'An error occurred during events search.'}/>
        );
    }

    if (data) {
        content = (
            <ul className="events-list">
                {data.map(event => (
                    <li key={event.id}>
                        <EventItem event={event}/>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <section className="content-section" id="all-events-section">
            <header>
                <h2>Find your next event!</h2>
                <form onSubmit={handleSubmit} id="search-form">
                    <input
                        type="search"
                        placeholder="Search events"
                        onChange={handleChange}
                    />
                    <button>Search</button>
                </form>
            </header>
            {content}
        </section>
    );
}
