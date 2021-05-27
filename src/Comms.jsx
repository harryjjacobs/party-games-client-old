import React from "react";

const ClientMessageNames = {
  MESSAGE_TYPE_PROMPT_RESPONSE: "prompt_response",
  MESSAGE_TYPE_REQUEST_JOIN: "request_join",
  MESSAGE_TYPE_REQUEST_REJOIN: "request_rejoin",
  MESSAGE_TYPE_HEARTBEAT_PONG: "heartbeat_pong",
};

const ServerMessageNames = {
  MESSAGE_TYPE_ACCEPT_JOIN: "accept_join",
  MESSAGE_TYPE_REJECT_JOIN: "reject_join",
  MESSAGE_TYPE_ACCEPT_REJOIN: "accept_rejoin",
  MESSAGE_TYPE_REJECT_REJOIN: "reject_rejoin",
  MESSAGE_TYPE_REJECT_INPUT: "reject_input",
  MESSAGE_TYPE_REQUEST_INPUT: "request_input",
  MESSAGE_TYPE_HIDE_PROMPT: "hide_prompt",
  MESSAGE_TYPE_HEARTBEAT_PING: "heartbeat_ping",
};

const CONNECTION_RETRY_INTERVAL = 2000; // milliseconds

const PRODUCTION = process.env.NODE_ENV === "production";
const ENDPOINT = PRODUCTION
  ? "wss://party-games-310323.ew.r.appspot.com/players"
  : "ws://localhost:8080/players";

class Comms extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      joined: false,
      showPrompt: false,
      messageData: {},
      error: false,
      errorText: "",
    };

    this.connect();
  }

  connect() {
    console.log("attempting to connect...");
    this.socket = new WebSocket(ENDPOINT);
    this.socket.onopen = () => this.handleOpen();
    this.socket.onclose = () => this.handleClose();
    this.socket.onerror = (error) => this.handleError(error);
    this.socket.onmessage = (msg) => this.handleMessage(msg.data);
  }

  handleOpen() {
    console.log("connected to server");
    this.setState({ connected: true });
    if (sessionStorage.getItem("rejoin") === "true") {
      const roomCode = sessionStorage.getItem("roomCode");
      const clientId = sessionStorage.getItem("clientId");
      if (roomCode && clientId) {
        this.requestRejoin(roomCode, clientId);
      }
    }
  }

  handleClose() {
    this.setState({
      connected: false,
      joined: false,
      showPrompt: false,
      inputData: {},
    });
    setTimeout(() => this.connect(), CONNECTION_RETRY_INTERVAL);
  }

  handleError(event) {
    console.log("websocket error ", event);
    this.socket.close();
  }

  sendMessageToRoom(messageType, roomCode, messageData) {
    messageData.roomCode = roomCode;
    this.sendMessage(messageType, messageData);
  }

  sendMessage(messageType, messageData) {
    const message = {
      type: messageType,
      data: messageData,
    };
    this.socket.send(JSON.stringify(message));
    console.log(`message sent: ${JSON.stringify(message)}`);
  }

  sendPromptResponse(messageData) {
    this.sendMessageToRoom(
      ClientMessageNames.MESSAGE_TYPE_PROMPT_RESPONSE,
      this.state.roomCode,
      messageData
    );
    // Clear saved prompt
    sessionStorage.setItem("lastPrompt", "");
  }

  requestJoin(roomCode, username) {
    if (!this.state.connected) {
      this.setState({
        error: true,
        errorText: "Not connected to server",
      });
      return;
    }
    this.sendMessageToRoom(
      ClientMessageNames.MESSAGE_TYPE_REQUEST_JOIN,
      roomCode,
      {
        username: username,
      }
    );
    this.setState({
      error: false,
      errorText: "",
    });
  }

  requestRejoin(roomCode, clientId) {
    this.sendMessageToRoom(
      ClientMessageNames.MESSAGE_TYPE_REQUEST_REJOIN,
      roomCode,
      {
        oldClientId: clientId,
      }
    );
    console.log(
      `Requesting to rejoin room ${roomCode} using stored clientId ${clientId} `
    );
  }

  handleMessage(messageRaw) {
    console.log(`message received: ${messageRaw}`);
    let message;
    try {
      message = JSON.parse(messageRaw);
    } catch (error) {
      console.debug("invalid message recieved", message);
      return;
    }
    switch (message.type) {
      case ServerMessageNames.MESSAGE_TYPE_HEARTBEAT_PING: {
        this.handleHeartbeatPing();
        break;
      }
      case ServerMessageNames.MESSAGE_TYPE_ACCEPT_JOIN: {
        if (!message.data.clientId || !message.data.roomCode) {
          console.debug(
            `invalid ${ServerMessageNames.MESSAGE_TYPE_ACCEPT_JOIN} message`
          );
          break;
        }
        this.setState({
          joined: true,
          roomCode: message.data.roomCode,
        });
        // In the event of a disconnect, attempt to rejoin
        sessionStorage.setItem("rejoin", "true");
        // Store the clientId
        sessionStorage.setItem("clientId", message.data.clientId);
        // Store the roomCode
        sessionStorage.setItem("roomCode", message.data.roomCode);
        break;
      }
      case ServerMessageNames.MESSAGE_TYPE_ACCEPT_REJOIN: {
        if (!message.data.clientId || !message.data.roomCode) {
          console.debug(
            `invalid ${ServerMessageNames.MESSAGE_TYPE_ACCEPT_REJOIN} message`
          );
          break;
        }
        this.setState({
          joined: true,
          roomCode: message.data.roomCode,
        });
        // In the event of a disconnect, attempt to rejoin
        sessionStorage.setItem("rejoin", "true");
        // Store the clientId
        sessionStorage.setItem("clientId", message.data.clientId);
        // Store the roomCode
        sessionStorage.setItem("roomCode", message.data.roomCode);
        // Restore any unhandled prompts
        // TODO: store timestamp and don't restore very old data
        const lastPrompt = this.getLastPrompt();
        if (lastPrompt) {
          // Show prompt
          this.setState({
            showPrompt: true,
            promptData: lastPrompt,
          });
        }
        break;
      }
      case ServerMessageNames.MESSAGE_TYPE_REJECT_JOIN: {
        // Hide previous error
        this.setState({ error: false });
        // Show new error
        this.setState({
          joined: false,
          error: true,
          errorText: message.data.reason,
        });
        // In the event of a disconnect, don't attempt to rejoin
        sessionStorage.setItem("rejoin", "false");
        // Clear the clientId, it's no longer valid
        sessionStorage.setItem("clientId", "");
        // Clear the roomCode, it's no longer valid
        sessionStorage.setItem("roomCode", "");
        break;
      }
      case ServerMessageNames.MESSAGE_TYPE_REJECT_REJOIN: {
        this.setState({ joined: false });
        // In the event of a disconnect, don't attempt to rejoin
        sessionStorage.setItem("rejoin", "false");
        // Clear the clientId, it's no longer valid
        sessionStorage.setItem("clientId", "");
        // Clear the roomCode, it's no longer valid
        sessionStorage.setItem("roomCode", "");
        break;
      }
      case ServerMessageNames.MESSAGE_TYPE_REJECT_INPUT: {
        this.setState({
          error: true,
          errorText: message.data.error,
        });
        break;
      }
      case ServerMessageNames.MESSAGE_TYPE_REQUEST_INPUT: {
        // Show prompt
        this.setState({
          showPrompt: true,
          promptData: message.data,
        });
        this.saveLastPrompt(message.data);
        break;
      }
      case ServerMessageNames.MESSAGE_TYPE_HIDE_PROMPT: {
        // Hide input display
        this.setState({ showPrompt: false });
        this.clearLastPrompt();
        break;
      }
      default:
        console.log(`message type ${message.type} not handled`);
        break;
    }
  }

  saveLastPrompt(data) {
    sessionStorage.setItem("lastPrompt", JSON.stringify(data));
  }

  getLastPrompt() {
    try {
      return JSON.parse(sessionStorage.getItem("lastPrompt"));
    } catch {}
    return undefined;
  }

  clearLastPrompt() {
    sessionStorage.removeItem("lastPrompt");
  }

  handleHeartbeatPing() {
    this.sendMessage(ClientMessageNames.MESSAGE_TYPE_HEARTBEAT_PONG, {});
  }

  componentDidUpdate(_prevProps, prevState, _snapshot) {
    if (this.state.connected) {
      if (!prevState.connected && !this.state.joined) {
        this.props.onJoinStateChanged(this.state.joined);
        this.props.onHideInputPrompt();
      }
      if (this.state.joined !== prevState.joined) {
        this.props.onJoinStateChanged(this.state.joined);
        this.props.onHideInputPrompt();
      }
      if (
        (this.state.showPrompt && !prevState.showPrompt) ||
        this.state.promptData != prevState.promptData
      ) {
        this.props.onShowInputPrompt(this.state.promptData);
      } else if (!this.state.showPrompt && prevState.showPrompt) {
        this.props.onHideInputPrompt();
      }
    } else if (prevState.connected) {
      this.props.onHideInputPrompt();
    }

    if (this.state.error) {
      if (!prevState.error || this.state.errorText !== prevState.errorText) {
        this.props.onError(this.state.errorText);
      }
    }
  }

  render() {
    return <div></div>;
  }
}

export default Comms;
