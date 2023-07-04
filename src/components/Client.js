import React from 'react'
import Avatar from 'react-avatar'

const Client = (props) => {
    return (
        <div>
            <Avatar name={props.userName} size='40' round='14px' />
            <h1 >{props.userName}</h1>
        </div>
    )
}

export default Client
