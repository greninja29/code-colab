import React from 'react'
import { v4 as uuidV4 } from 'uuid'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');

    const createNewRoom = (e) => {
        const id = uuidV4();
        setRoomId(id);
        toast.success('Room created successfully');
    }

    const joinRoom = () => {
        if (!roomId || !userName) {
            toast.error('Please fill both fields');
            return;
        }
        navigate(`/editor/${roomId}`, {
            state: {
                userName: userName
            }
        });
    }
    const handleKeyInput = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }

    }
    return (
        <div className='homePageWrapper flex items-center justify-center text-white h-screen'>
            <div className='formWrapper p-4 rounded-md max-w-lg' >
                <img className='h-16 ' src="/code-sync.png" alt="code-sync-logo" />
                <h1>Paste invitation room id</h1>
                <div className='gap-x-2 flex flex-col gap-2'>
                    <input value={roomId} onChange={(e) => setRoomId(e.target.value)} onKeyUp={handleKeyInput} className='rounded-md text-black focus:outline-none p-1 font-semibold' type="text" placeholder="  Enter room id" />
                    <input value={userName} onChange={(e) => setUserName(e.target.value)} onKeyUp={handleKeyInput} className='rounded-md text-black focus:outline-none p-1 font-semibold' type="text" placeholder="  User name" />
                    <button onClick={joinRoom} className=''>Join</button>
                    <span className='flex flex-col gap-2'>
                        if you don't have room id, create &nbsp;
                        <button className='' onClick={createNewRoom}>New Room</button>
                    </span>
                </div>
            </div>
            <footer className='fixed bottom-0'>
                <h4>footer section</h4>
            </footer>
        </div>
    )
}

export default Home

