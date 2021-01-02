import React from 'react';
import io from 'socket.io-client';

const ClientMessageNames = {
  MESSAGE_TYPE_PROMPT_RESPONSE: 'prompt_response',
  MESSAGE_TYPE_REQUEST_JOIN: 'request_join',
  MESSAGE_TYPE_REQUEST_REJOIN: 'request_rejoin'
}

const ServerMessageNames = {
  MESSAGE_TYPE_ACCEPT_JOIN: 'accept_join',
  MESSAGE_TYPE_REJECT_JOIN: 'reject_join',
  MESSAGE_TYPE_REJECT_REJOIN: 'reject_rejoin',
  MESSAGE_TYPE_REJECT_INPUT: 'reject_input',
  MESSAGE_TYPE_REQUEST_INPUT: 'request_input',
  MESSAGE_TYPE_HIDE_PROMPT: 'hide_prompt',
}

class Comms extends React.Component {
  constructor(props) {
    super(props);

    this.socket = io('http://localhost:3000/players', /*{ transports: ['websocket'] }*/);

    this.state = {
      connected: false,
      joined: false,
      showPrompt: false,
      promptData: {},
      error: false,
      errorText: ''
    };

    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.requestJoin = this.requestJoin.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.socket.on('connect', this.handleConnect);
    this.socket.on('disconnect', this.handleDisconnect);

    this.socket.on('message', (msg) => {
      this.handleMessage(msg);
    });
  }

  handleConnect(msg) {
    console.log('connected to server')
    this.setState({ connected: true });
    if (sessionStorage.getItem('rejoin') === 'true') {
      this.requestRejoin(
        sessionStorage.getItem('roomCode'),
        sessionStorage.getItem('clientId')
      );
    }
  }

  handleDisconnect(msg) {
    this.setState({
      connected: false,
      joined: false,
      showPrompt: false,
      inputData: {},
    });
  }

  sendMessage(roomCode, messageType, messageData) {
    //message.time = Math.floor(Date.now() / 1000);
    const message = {
      roomCode: roomCode,
      type: messageType,
      data: messageData
    };
    this.socket.send(message);
    console.log(`${messageType} sent to room ${roomCode}: ${JSON.stringify(message)}`);
  }

  sendPromptResponse(messageData) {
    this.sendMessage(
      this.state.roomCode,
      ClientMessageNames.MESSAGE_TYPE_PROMPT_RESPONSE,
      messageData
    );
    // Hide the prompt once we've sent a response
    this.setState({ showPrompt: false });
  }

  requestJoin(roomCode, username) {
    if (!this.state.connected) {
      this.setState({
        error: true,
        errorText: 'Not connected to server'
      });
      return;
    }
    this.sendMessage(
      roomCode,
      ClientMessageNames.MESSAGE_TYPE_REQUEST_JOIN,
      { username: username }
    );
    this.setState({
      error: false,
      errorText: ''
    });
  }

  requestRejoin(roomCode, clientId) {
    this.sendMessage(
      roomCode,
      ClientMessageNames.MESSAGE_TYPE_REQUEST_REJOIN,
      { oldClientId: clientId }
    );
    console.log(`Requesting to rejoin room ${roomCode} using stored clientId ${clientId} `);
  }

  handleMessage(message) {
    console.log(`message received: ${JSON.stringify(message)}`);

    switch (message.messageType) {
      case ServerMessageNames.MESSAGE_TYPE_ACCEPT_JOIN:
        this.setState({
          joined: true,
          roomCode: message.data.roomCode
        });
        // In the event of a disconnect, attempt to rejoin
        sessionStorage.setItem('rejoin', 'true');
        // Store the clientId
        sessionStorage.setItem('clientId', message.data.clientId);
        // Store the roomCode
        sessionStorage.setItem('roomCode', message.data.roomCode);
        break;
      case ServerMessageNames.MESSAGE_TYPE_REJECT_JOIN:
        // Hide previous error
        this.setState({ error: false });
        // Show new error
        this.setState({
          error: true,
          errorText: message.data.reason,
          joined: false
        });
        // In the event of a disconnect, don't attempt to rejoin
        sessionStorage.setItem('rejoin', 'false');
        // Clear the clientId, it's no longer valid
        sessionStorage.setItem('clientId', '');
        break;
      case ServerMessageNames.MESSAGE_TYPE_REJECT_REJOIN:
        this.setState({ joined: false });
        // In the event of a disconnect, don't attempt to rejoin
        sessionStorage.setItem('rejoin', 'false');
        // Clear the clientId, it's no longer valid
        sessionStorage.setItem('clientId', '');
        break;
      case ServerMessageNames.MESSAGE_TYPE_REJECT_INPUT:
        this.setState({
          error: true,
          errorText: message.data.error
        });
        break;
      case ServerMessageNames.MESSAGE_TYPE_REQUEST_INPUT:
        // Show prompt
        this.setState({
          showPrompt: true,
          promptData: message.data.prompt,
        });
        break;
      case ServerMessageNames.MESSAGE_TYPE_HIDE_PROMPT:
        // Hide input display
        this.setState({ showPrompt: false });
        break;
      default:
        break;
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.connected) {
      if (!prevState.connected && !this.state.joined) {
        this.props.onJoinStateChanged(this.state.joined);
        this.props.onHideInputPrompt();
      }
      if (this.state.joined !== prevState.joined) {
        this.props.onJoinStateChanged(this.state.joined);
        this.props.onHideInputPrompt();
      }
      if (this.state.showPrompt && !prevState.showPrompt) {
        this.props.onShowInputPrompt(this.state.promptData);
      } else if (!this.state.showPrompt && prevState.showPrompt) {
        this.props.onHideInputPrompt();
      }
    } else if (prevState.connected) {
      this.props.onHideInputPrompt();
    }

    if (this.state.error) {
      if (!prevState.error || (this.state.errorText !== prevState.errorText)) {
        this.props.onError(this.state.errorText);
      }
    }
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}

export default Comms;