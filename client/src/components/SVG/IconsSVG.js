import React from "react";
import IcomoonReact from "icomoon-react";
import iconSet from "./selection.json";

export class IconsSVG extends React.Component {


    render() {
        return (
            <IcomoonReact
                className={this.props.className}
                iconSet={iconSet}
                color={this.props.color}
                size={this.props.size}
                icon={this.props.icon}
            />
        );
    }
}