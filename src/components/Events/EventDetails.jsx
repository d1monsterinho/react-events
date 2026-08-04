import {Link, Outlet, useNavigate, useParams} from 'react-router-dom';

import Header from '../Header.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {deleteEvent, fetchEventData, queryClient} from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
    const params = useParams();
    const navigate = useNavigate();

    const {data: event, isPending, isError, error} = useQuery({
        queryKey: ['events', params.id],
        queryFn: ({signal}) => fetchEventData({
            signal,
            id: params.id,
        }),
    });

    const {mutate, isPending: isDeletionPending, isError: isDeletionError, error: deletionError} = useMutation({
        mutationFn: deleteEvent,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                refetchType: 'none',
            });
            navigate('/events')
        },
    });

    function handleDeleteClick() {
        mutate({id: params.id});
    }

    let formattedDate;

    if (event) {
        formattedDate = new Date(event.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }


    return (
        <>
            <Outlet/>
            <Header>
                <Link to="/events" className="nav-item">
                    View all Events
                </Link>
            </Header>
            <article id="event-details">
                {isPending && (
                    <div className="center" id="event-details-content">
                        <p>Loading event...</p>
                    </div>
                )}
                {event && !isError && (
                    <>
                        <header>
                            <h1>{event.title}</h1>
                            {isDeletionPending && 'Deleting event...'}
                            {!isDeletionPending && (
                                <nav>
                                    <button onClick={handleDeleteClick}>Delete</button>
                                    <Link to="edit">Edit</Link>
                                </nav>
                            )}
                        </header>
                        <div id="event-details-content">
                            <img src={`http://localhost:3000/${event.image}`} alt="Event Image"/>
                            <div id="event-details-info">
                                <div>
                                    <p id="event-details-location">{event.location}</p>
                                    <time dateTime={`Todo-DateT$Todo-Time`}>{`${formattedDate} @ ${event.time}`}</time>
                                </div>
                                <p id="event-details-description">{event.description}</p>
                            </div>
                        </div>
                    </>

                )}
                {isError && (
                    <ErrorBlock
                        title="Failed to load event data."
                        message={error.info?.message || 'Error occurred while fetching event data.'}
                    />
                )}
                {isDeletionError && (
                    <ErrorBlock
                        title="Failed to delete event."
                        message={deletionError.info?.message || 'Error occurred while deleting event.'}
                    />
                )}
            </article>
        </>
    );
}
