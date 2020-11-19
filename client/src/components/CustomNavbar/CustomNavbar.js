import React from "react";
import { Navbar, Button, Col } from "react-bootstrap";
import API from "../../utils/API";

export class CustomNavbar extends React.Component {
    state = { token: null };

    componentDidMount() {
        let sessionToken = localStorage.getItem("token");
        this.setState({
            token: sessionToken
        });
    }

    isLoggedIn = () => {
        return this.state.token !== null;
    }

    onClickLoginButton = () => {
        window.location = "/login";
    }

    disconnect = () => {
        API.logout();
        this.setState({ token: null });
    };

    render() {
        let AuthenticationButton;
        if (this.isLoggedIn()) {
            AuthenticationButton = <Button onClick={this.disconnect} size="sm" style={{ float: "right" }} type="submit">Se déconnecter</Button>
        } else {
            AuthenticationButton = <Button onClick={this.onClickLoginButton} size="sm" style={{ float: "right" }}>Connexion</Button>
        }
        return (
            <>
                <Navbar bg="dark" variant="dark">
                    <Col md={3}>
                        <Navbar.Brand href="/">
                            <img
                                alt=""
                                src="logo_125x25.png"
                                className="d-inline-block align-top"
                            />
                        </Navbar.Brand>
                    </Col>
                    <Col md={6}>
                        {/* Navbar items */}
                    </Col>
                    <Col md={3}>
                        {AuthenticationButton}
                    </Col>
                </Navbar>
            </>
        )
    }
}