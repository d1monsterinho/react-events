import {Link, useNavigate, useParams} from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {editEvent, fetchEventData, queryClient} from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EditEvent() {
    const navigate = useNavigate();
    const params = useParams();

    const id = params.id;

    const {data: event, isPending, isError, error} = useQuery({
        queryKey: ['events', id],
        queryFn: ({signal}) => fetchEventData({
            signal,
            id,
        }),
    });

    const {mutate, isError: isEditingError, error: editingError} = useMutation({
        mutationFn: editEvent,
        onMutate: async ({event}) => {
            await queryClient.cancelQueries({
                queryKey: ['events', id],
            });

            const prevEventData = queryClient.getQueryData(['events', id]);

            queryClient.setQueryData(['events', id], event);

            return prevEventData;
        },
        onError: (error, data, context) => {
            queryClient.setQueryData(['events', id], context);
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ['events', id],
            });
        }
    });

    function handleSubmit(formData) {
        mutate({
            id,
            event: {
                ...formData,
            }
        });

        navigate("../");
    }

    function handleClose() {
        navigate('../');
    }

    return (
        <>
            <Modal onClose={handleClose}>
                {isPending && (
                    <div className="center">
                        <LoadingIndicator/>
                    </div>
                )}
                {event && (
                    <EventForm inputData={event} onSubmit={handleSubmit}>
                        <Link to="../" className="button-text">
                            Cancel
                        </Link>
                        <button type="submit" className="button">
                            Update
                        </button>
                        {isEditingError && (
                            <ErrorBlock
                                title="Failed edit event."
                                message={editingError.info?.message || 'Error occurred while editing event data.'}
                            />
                        )}

                    </EventForm>
                )}
                {isError && (
                    <>
                        <ErrorBlock
                            title="Failed to load event data."
                            message={error.info?.message || 'Error occurred while fetching event data.'}
                        />
                        <div className="form-actions">
                            <Link className="button" to="../">
                                Okay
                            </Link>
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
}
