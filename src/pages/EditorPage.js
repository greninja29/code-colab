import React, { useState, useRef, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Client from '../components/Client'
import Editorv5 from '../components/Editorv5';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { toast } from 'react-hot-toast';

const EditorPage = () => {
    const [clients, setClients] = useState([]);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const socketRef = useRef(null);
    const { roomId } = useParams();

    //to store code
    const codeRef = useRef(null);

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room id copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy room id');
            console.error(error);

        }
    }
    const leaveRoom = () => {
        socketRef.current.disconnect();
        reactNavigator('/');
    }

    useEffect(() => {
        const init = async () => {

            socketRef.current = await initSocket();
            //listen for connect event
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            //listen for connect_failed event
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            const handleErrors = (e) => {
                console.log('socket error', e);
                toast.error('socket connection failed ,try again later');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                userName: location.state?.userName,
            });

            //Listen for joined event
            socketRef.current.on(ACTIONS.JOINED, ({ clients, userName, socketId }) => {
                if (userName !== location.state?.userName) {
                    toast.success(`${userName} joined the room`);
                    console.log(`${userName} joined`, clients);
                }
                setClients(clients);
                // to get the code at the time of joining
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            });
            //Listen for disconnected event
            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
                toast.success(`${userName} left the room`);
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId)
                });
                console.log(`${userName} left the room`);
                setClients((clients) => clients.filter((client) => client.socketId !== socketId));
            });
        }
        init();
        //cleanup
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);

        }
    }, []);


    if (!location.state) {
        return <Navigate to='/' />
    }

    return (
        <div>
            <div className='MainWrap p-2 grid grid-cols-4 '>
                <div className='asideWrap h-screen p-2 text-white flex flex-col justify-between'>
                    <div className='asideInner flex flex-col gap-2'>
                        <img className='w-auto border-b-2 p-2 border-b-slate-600' src="/code-sync.png" alt="logo" />
                        <h1>connected</h1>
                        <div className='clientsList grid grid-cols-2'>
                            {clients.map((client) => (
                                <Client key={client.socketId} userName={client.userName} />
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <button onClick={copyRoomId}>Copy Room Id</button>
                        <button onClick={leaveRoom} className='bg-red-800 hover:bg-red-600'>Leave</button>
                    </div>
                </div>
                <div className='editorWrap col-span-3'>
                    <Editorv5 socketRef={socketRef} roomId={roomId} onCodeChange={(code) => { codeRef.current = code }} />
                </div>
            </div>
        </div>
    )
}

export default EditorPage
