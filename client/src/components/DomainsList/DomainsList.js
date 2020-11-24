import React from "react";
import { Row, Table } from "react-bootstrap";
import { FiArrowRightCircle } from "react-icons/fi";
import API from "../../utils/API";
import { CustomPagination } from "../CustomPagination/CustomPagination";
import { SearchFilter } from "../SearchFilter/SearchFilter";

export class DomainsList extends React.Component {
    state = {
        domains: [],
        domainsCount: 0,
        selectedDomain: null,
        currentPage: 1,
        resultsDisplayPerPage: 20
    }

    componentDidMount() {
        this._updateDomains();
    }

    onClickDomainRow = (domain) => {
        this.setState({ selectedDomain: domain });
        this.props.onSelectedDomainChange(domain);
    }

    onChangePage = (newPage) => {
        this.setState({ currentPage: newPage }, this._updateDomains);
    }

    onSearchNewDomains = (event) => {
        this.setState({ domains: event.domainsList, domainsCount: event.domainsCount, currentPage: 1 })
    }

    _updateDomains = () => {
        API.getDomainsForPage(this.state.currentPage, this.state.resultsDisplayPerPage)
            .then(response => {
                this.setState({ domains: response.data.domainsList });
                return API.getCountDomains()
            })
            .then(response => {
                this.setState({ domainsCount: response.data.domainsCount });
            })
    }

    isSelectedDomain = (domain) => {
        return this.state.selectedDomain === domain;
    }

    onChangeNbResultsPerPage = (nbResults) => {
        this.setState({ resultsDisplayPerPage: nbResults }, this._updateDomains)
    }

    render() {
        return (
            <div>
                <Row className="justify-content-center">
                    <SearchFilter onDomainsSearch={this.onSearchNewDomains} onChangeNbResultsPerPage={this.onChangeNbResultsPerPage} />
                    <Table striped bordered hover>
                        <tbody>
                            {this.state.domains.map((domain, index) => (
                                <tr key={index} className={this.isSelectedDomain(domain) ? "bg-secondary text-light" : ""}>
                                    <td onClick={() => { this.onClickDomainRow(domain) }}>
                                        {domain.domainName}

                                        {this.isSelectedDomain(domain) && <FiArrowRightCircle className="float-right" style={{ fontSize: "30px" }} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <CustomPagination currentPage={this.state.currentPage} totalResults={this.state.domainsCount} pageChangeHandler={this.onChangePage} />
                </Row>
            </div>
        )
    }
}