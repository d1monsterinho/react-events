import {Link, Outlet, useNavigate, useParams} from 'react-router-dom';

import Header from '../Header.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {deleteEvent, fetchEventData, queryClient} from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {useState} from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
    const [isDeleting, setIsDeleting] = useState(false);
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

    function handleStartDeletion() {
        setIsDeleting(true);
    }

    function handleStopDeletion() {
        setIsDeleting(false);
    }

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
            {isDeleting && (
                <Modal onClose={handleStopDeletion}>
                    <h2>Are you sure?</h2>
                    <p>This event will be deleted</p>
                    <div className="form-actions">
                        {isDeletionPending && 'Deleting event...'}
                        {!isDeletionPending && (
                            <>
                                <button className="button-text" onClick={handleStopDeletion}>Cancel</button>
                                <button className="button" onClick={handleDeleteClick}>Delete</button>
                            </>
                        )}
                    </div>

                    {isDeletionError && (
                        <ErrorBlock
                            title="Failed to delete event."
                            message={deletionError.info?.message || 'Error occurred while deleting event.'}
                        />
                    )}
                </Modal>
            )}
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
                            <nav>
                                <button onClick={handleStartDeletion}>Delete</button>
                                <Link to="edit">Edit</Link>
                            </nav>
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
            </article>
        </>
    );
}
