import React from "react";
import { Image } from "react-bootstrap";
import { CustomNavbar } from "../CustomNavbar/CustomNavbar";

export class Landing extends React.Component {

    render() {
        return (
            <>
                <CustomNavbar />
                <div>
                    <h1>En cours de développement</h1>
                    <Image src="logo_noir.png" width="400" height="100" />
                </div>
            </>
        )
    }
}