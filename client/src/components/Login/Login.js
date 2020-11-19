import React from "react";
import API from "../../utils/API";
import { Button, FormGroup, FormControl, FormLabel, Form, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { CustomNavbar } from "../CustomNavbar/CustomNavbar";

export class Login extends React.Component {
    state = {
        email: "",
        password: "",
    }

    send = async () => {
        const { email, password } = this.state;
        if (!email || email.length === 0) {
            // handle form validation
            return;
        }
        if (!password || password.length === 0) {
            // handle form validation
            return;
        }

        try {
            API.login(email, password)
                .then(response => {
                    localStorage.setItem("token", response.data.token);
                    window.location = "/dashboard";
                })
        }
        catch (error) {
            console.error(error);
        }
    };

    handleChange = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    };

    render() {
        const { email, password } = this.state;

        return (
            <>
                <CustomNavbar />
                <div className="Login">
                    <Image src="logo.png" style={{ width: "60%", marginBottom: "50px" }} />
                    <Form style={{ border: "1px ridge #ada9a8", padding: "20px", marginBottom: "20px", borderRadius: "15px" }}>
                        <FormGroup controlId="email" bssize="large">
                            <FormLabel>Email</FormLabel>
                            <FormControl autoFocus type="email" value={email} onChange={this.handleChange} />
                        </FormGroup>
                        <FormGroup controlId="password" bssize="large">
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl value={password} onChange={this.handleChange} type="password" />
                        </FormGroup>

                        <Button onClick={this.send} block bssize="large" type="submit">
                            Connexion
                        </Button>
                    </Form>
                    <Link to="/signup" style={{ display: "block", marginTop: "10px" }}>Créer un compte</Link>
                </div>
            </>
        )
    }
}