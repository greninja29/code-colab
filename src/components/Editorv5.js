import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editorv5 = (props) => {
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(document.getElementById('real-time-editor'), {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
      });
      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        props.onCodeChange(code);
        if (origin !== 'setValue') {
          props.socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId: props.roomId,
            code,
          });
        }
        console.log('code', code);
      });

    }
    init();
  }, [])

  useEffect(() => {
    if (props.socketRef.current) {
      props.socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
      return () => {
        props.socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    }
  }, [props.socketRef.current]);


  return <textarea id="real-time-editor" />;
}
export default Editorv5
