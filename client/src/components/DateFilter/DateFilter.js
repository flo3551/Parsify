import React from "react";
import { Col, Container, FormControl, Row } from "react-bootstrap";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export class DateFilter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dateType: "exactDate",
            pickerStartDate: new Date(),
            pickerEndDate: null,
            exactDate: null,
            minDate: null,
            maxDate: null
        };

        this.baseState = this.state;
        this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
        this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
        this.handleChangeDateType = this.handleChangeDateType.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.enabled && !this.props.enabled) {
            this.setState(this.baseState, () => {
                this.props.onDateFiltersChange(this.state);
            });
        }
    }

    handleChangeStartDate(date) {
        let dateType = this.state.dateType;
        let setStateCallback = () => {
            if (this.state.dateType === "rangeDate" && !(this.state.pickerEndDate || this.isDateRangeValid())) {
                return;
            }

            this.props.onDateFiltersChange(this.state);
        };

        this.setState({
            pickerStartDate: date,
            maxDate: dateType === "beforeDate" ? date : dateType === "rangeDate" ? this.state.maxDate : null,
            minDate: dateType === "afterDate" || dateType === "rangeDate" ? date : null,
            exactDate: dateType === "exactDate" ? date : null,
        }, setStateCallback);
    }

    handleChangeEndDate(date) {
        this.setState({
            pickerEndDate: date,
            maxDate: date
        }, () => {
            if (!this.isDateRangeValid()) {
                return;
            }
            if (this.state.pickerStartDate) {
                this.props.onDateFiltersChange(this.state);
            }
        });
    }

    handleChangeDateType(event) {
        let dateType = event.target.value;

        this.setState({
            dateType: dateType,
            pickerEndDate: dateType === "rangeDate" ? new Date().setDate(this.state.pickerStartDate.getDate() + 1) : null
        }, dateType !== "rangeDate" ? () => { this.handleChangeStartDate(this.state.pickerStartDate) } : null);
    }

    isDateRangeValid = () => {
        let valid = false;
        let startDate = this.state.pickerStartDate;
        let endDate = this.state.pickerEndDate;
        if (this.state.dateType !== "rangeDate") {
            return true;
        }
        if ((new Date(startDate) > new Date(endDate)) || (new Date(endDate) < new Date(startDate))) {
            valid = false;
        } else {
            valid = true;
        }

        return valid;
    }

    _renderDatePicker = () => {
        let render =
            <Row>
                {this.state.dateType === "rangeDate" &&
                    <Col md={2}>
                        <span>Du</span>
                    </Col>
                }
                <Col md={10}>
                    <DatePicker
                        selected={this.state.pickerStartDate}
                        onChange={this.handleChangeStartDate}
                        name="startDate"
                        dateFormat="dd/MM/yyyy"
                        disabled={!this.props.enabled}
                    />
                </Col>
            </Row>


        if (this.state.dateType === "rangeDate") {
            render = [render,
                <Row className="mt-1">
                    <Col md={2}>
                        <span>au</span>
                    </Col>
                    <Col md={10}>
                        <DatePicker
                            selected={this.state.pickerEndDate}
                            onChange={this.handleChangeEndDate}
                            name="endDate"
                            dateFormat="dd/MM/yyyy"
                            disabled={!this.props.enabled}
                        />
                    </Col>
                </Row>]
        }

        return render;
    }

    _dateErrorRendering = () => {
        let dateRangeValid = this.isDateRangeValid();

        if (!dateRangeValid) {
            return <Row><span className="text-danger">La date de début doit être inférieure à la date de fin</span></Row>
        }
    }

    render() {
        return (
            <Container className="pt-1">
                <Row>
                    <Col md={4} className="text-left">
                        <FormControl as="select" size="sm" custom style={{ width: "90px" }} onChange={this.handleChangeDateType} disabled={!this.props.enabled}>
                            <option value="exactDate">Le</option>
                            <option value="beforeDate">Avant le</option>
                            <option value="afterDate">Après le</option>
                            <option value="rangeDate">Période</option>
                        </FormControl>
                    </Col>
                    <Col md={8}>
                        {this._renderDatePicker()}
                    </Col>
                </Row>
                {this._dateErrorRendering()}
            </Container >
        )
    }
}