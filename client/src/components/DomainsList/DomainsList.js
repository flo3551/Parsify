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
        resultsDisplayPerPage: 20,
        keywordFilter: null,
        exactDateFilter: null,
        minDateFilter: null,
        maxDateFilter: null,
        isFavoriteDomains: false
    }

    componentDidMount() {
        this._updateDomains(true);
    }

    onClickDomainRow = (domain) => {
        this.setState({ selectedDomain: domain });
        this.props.onSelectedDomainChange(domain);
    }

    onChangePage = (newPage) => {
        this.setState({ currentPage: newPage }, () => { this._updateDomains(false) });
    }

    onSearchNewDomains = (event) => {
        this.setState({ domains: event.domainsList, domainsCount: event.domainsCount, currentPage: 1 })
    }

    _updateDomains = (goToFirstPage) => {
        let login = localStorage.getItem("emailLogin");
        API.getDomainsForPageAndFilters(this.state.currentPage, this.state.resultsDisplayPerPage, this.state.keywordFilter, this.state.zoneFilter, this.state.exactDateFilter, this.state.minDateFilter, this.state.maxDateFilter, this.state.isFavoriteDomains, login)
            .then(response => {
                this.setState({ domains: response.data.domainsList });
                return API.getCountDomains(this.state.keywordFilter, this.state.zoneFilter, this.state.exactDateFilter, this.state.minDateFilter, this.state.maxDateFilter, this.state.isFavoriteDomains, login)
            })
            .then(response => {
                this.setState({ domainsCount: response.data.domainsCount, currentPage: goToFirstPage ? 1 : this.state.currentPage });
            })
    }

    isSelectedDomain = (domain) => {
        return this.state.selectedDomain === domain;
    }

    onChangeNbResultsPerPage = (nbResults) => {
        this.setState({ resultsDisplayPerPage: nbResults }, () => { this._updateDomains(true) })
    }

    onFiltersChange = (filters) => {
        this.setState({
            keywordFilter: filters.keywordInput,
            exactDateFilter: filters.exactDate,
            minDateFilter: filters.minDate,
            maxDateFilter: filters.maxDate,
            zoneFilter: filters.zone,
            isFavoriteDomains: filters.isFavoriteDomains
        }, () => { this._updateDomains(true) });
    }

    render() {
        return (
            <div>
                <Row className="justify-content-center">
                    <SearchFilter onFilterChange={this.onFiltersChange} onFavoriteChange={this.onFavoriteChange} onDomainsSearch={this.onSearchNewDomains} onChangeNbResultsPerPage={this.onChangeNbResultsPerPage} />
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>
                                    {this.state.domainsCount} résultat(s)
                                </th>
                            </tr>
                        </thead>
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