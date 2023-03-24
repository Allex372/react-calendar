import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, momentLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from 'moment';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import './Calendar.css';
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
    "en-US": require("date-fns")
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

momentLocalizer(moment);

const DragAndDropCalendar = withDragAndDrop(Calendar);

interface ChoseDay {
    id?: number;
    title?: string;
    desc?: string;
    start?: Date;
    end?: Date;
    newStartDate?: Date;
    newEndDate?: Date;
}

let eventArray: Object[] = [{ id: 1, desc: "asd", end: new Date(2021, 5, 8, 7, 0, 0), start: new Date(2021, 5, 8, 7, 0, 0), title: "ad" }];

export const MyCalendar = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEdit, setModalEditOpen] = useState(false);
    const [modalDrop, setModalDropOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<ChoseDay | null>();

    const [newEvent, setNewEven] = useState<ChoseDay | null>(null);

    const handleOpenDialogCreate = (e: any) => {
        // @ts-ignore
        console.log(e);
        const objId = eventArray.length;

        setNewEven({ ...newEvent, newStartDate: e.start, newEndDate: e.start, id: objId + 1 })

        setModalOpen(true);
    }

    const handleOpenDialogEdit = (e: ChoseDay) => {
        eventArray.find((el: ChoseDay) => {
            if (el.id === e.id) {
                setEventToEdit({
                    ...el,
                    title: e.title && el?.title,
                    desc: e.desc && el?.desc,
                    start: e.start && el?.start,
                    end: e.end && el?.end,
                })
            }
        });
        setModalEditOpen(true);
    }

    useEffect(() => {
        const today = newEvent?.newStartDate;
        const trueTime = newEvent?.start;
        const todayToArray = today?.toString().trim().split(" ");
        const trueTimeToArray = trueTime?.toString().trim().split(" ");
        const removed = todayToArray?.splice(2, 1)[0];
        if (removed && trueTimeToArray && trueTimeToArray?.length > 3) {
            trueTimeToArray?.splice(2, 1, removed);
            const parsedTime = new Date(trueTimeToArray.join(' '));
            setNewEven({ ...newEvent, start: parsedTime });
        }

    }, [newEvent]);

    useEffect(() => {
        const time = newEvent?.end;
        const date = newEvent?.newEndDate;
        const timeToArray = time?.toString().trim().split(" ");
        const dateToArray = date?.toString().trim().split(" ");
        const removed = timeToArray?.splice(4, 1)[0];
        if (removed && dateToArray && dateToArray?.length > 3) {
            dateToArray?.splice(4, 1, removed);
            const parsedTime = new Date(dateToArray.join(' '));
            // @ts-ignore
            setNewEven({ ...newEvent, end: parsedTime });
        }
    }, [newEvent]);

    const handleEditEvent = () => {
        if (eventToEdit) {
            const index = eventArray.findIndex((el: ChoseDay) => el.id === eventToEdit.id);
            eventArray.splice(index, 1, eventToEdit);
        }
        setModalEditOpen(false);
    }

    const handleSelect = () => {
        if (newEvent) {
            eventArray.push(newEvent as ChoseDay);
            setNewEven(null);
            setModalOpen(false);
        }
    }

    const handleDeleteEvent = (id?: number) => {
        const index = eventArray.findIndex((el: ChoseDay) => el.id === id);
        eventArray.splice(index, 1);
        setModalEditOpen(false);
    }

    const handleMoveEvent = (e: any) => {
        const elId = e.event.id;
        const startDate = e.start;
        const endDate = e.end;

        const obj = eventArray.find((el: ChoseDay) => el.id == elId);

        if (obj) {
            let copy: ChoseDay = Object.assign({}, obj);
            copy.start = startDate;
            copy.end = endDate;
            handleDropEvent(copy);
        }

        setModalDropOpen(true);
    }

    const handleDropEvent = (copyOfObj: ChoseDay) => {
        const index = eventArray.findIndex((el: ChoseDay) => el.id === copyOfObj.id);

        eventArray.splice(index, 1, copyOfObj);

        setModalDropOpen(false);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <DragAndDropCalendar
                    events={eventArray}
                    localizer={localizer}
                    style={{ height: 700 }}
                    selectable
                    // @ts-ignore
                    onEventDrop={(e) => handleMoveEvent(e)}
                    // @ts-ignore
                    onSelectSlot={(e) => handleOpenDialogCreate(e)}
                    // @ts-ignore
                    onDoubleClickEvent={event => handleSelectedCard(event)}
                    // @ts-ignore
                    onSelectEvent={(e: any) => handleOpenDialogEdit(e)}
                />

                {/* Material-ui Modal for booking new appointment */}
                <Dialog
                    PaperProps={{
                        style: {
                            padding: '40px'
                        },
                    }}
                    open={modalOpen}
                >
                    <div className='input-wrapper '>
                        <TextField
                            label="Title"
                            onChange={(e): any => { setNewEven({ ...newEvent, title: e.target.value }) }}
                        />
                    </div>

                    <br />
                    <div className='input-wrapper '>
                        <TextField
                            label="Description"
                            style={{
                                marginBottom: "15px"
                            }}
                            // @ts-ignore
                            onChange={(e): any => { setNewEven({ ...newEvent, desc: e.target.value }) }}
                        />
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>

                        <div className='input-wrapper '>
                            <TimePicker
                                label="Start Time"
                                minutesStep={5}
                                // @ts-ignore
                                onChange={(e): any => { setNewEven({ ...newEvent, start: e.toDate() }) }}
                            />
                        </div>

                        <div className='input-wrapper '>
                            <TimePicker
                                label="End Time"
                                minutesStep={5}
                                // @ts-ignore
                                onChange={(e): any => { setNewEven({ ...newEvent, end: e.toDate() }) }}
                            />
                        </div>

                    </LocalizationProvider>

                    <div className='btn-wrapper'>
                        <Button onClick={() => setModalOpen(false)}>cancel</Button>
                    </div>
                    <div className='btn-wrapper'>
                        <Button onClick={() => handleSelect()}>submit</Button>
                    </div>

                </Dialog>

                {/*modal edit*/}
                <Dialog
                    PaperProps={{
                        style: {
                            padding: '40px'
                        },
                    }}
                    open={modalEdit}
                >
                    <div className='input-wrapper '>
                        <TextField
                            label="Title"
                            value={eventToEdit?.title}
                            // @ts-ignore
                            onChange={(e): any => { setEventToEdit({ ...eventToEdit, title: e.target.value }) }}
                        />
                    </div>

                    <br />
                    <div className='input-wrapper '>
                        <TextField
                            label="Description"
                            value={eventToEdit?.desc}
                            // @ts-ignore
                            onChange={(e): any => { setEventToEdit({ ...eventToEdit, desc: e.target.value }) }}
                        />
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className='input-wrapper '>
                            <TimePicker
                                label="Start Time"
                                defaultValue={moment(eventToEdit?.start)}
                                minutesStep={5}
                                // @ts-ignore
                                onChange={(e): any => { setEventToEdit({ ...eventToEdit, start: moment(e) }) }}
                            />
                        </div>

                        <div className='input-wrapper '>
                            <TimePicker
                                label="End Time"
                                defaultValue={moment(eventToEdit?.end)}
                                minutesStep={5}
                                // @ts-ignore
                                onChange={(e): any => { setEventToEdit({ ...eventToEdit, end: moment(e) }) }}
                            />
                        </div>
                    </LocalizationProvider>
                    <div className='btn-wrapper'>
                        <Button sx={{ marginTop: '20px' }} onClick={() => setModalEditOpen(false)}>cancel</Button>
                    </div>
                    <div className='btn-wrapper'>
                        <Button onClick={() => handleEditEvent()}>submit</Button>
                    </div>
                    <div className='btn-wrapper'>
                        <Button onClick={() => handleDeleteEvent(eventToEdit?.id)}>Delete event</Button>
                    </div>

                </Dialog>

                {/* Delete dialog */}
                <Dialog
                    PaperProps={{
                        style: {
                            padding: '40px'
                        },
                    }}
                    open={modalDrop}
                >
                    <label>Are you sure?</label>
                    <Button onClick={() => setModalDropOpen(false)}>yes</Button>
                </Dialog>
            </div>
        </DndProvider>
    );
}

