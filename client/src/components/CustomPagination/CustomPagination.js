import React from "react";
import { Pagination } from "react-bootstrap";

export class CustomPagination extends React.Component {
    onClickPage = (newPage) => {
        this.props.pageChangeHandler(newPage);
    }

    render() {
        let currentPage = this.props.currentPage;
        let totalResultsCount = this.props.totalResults;
        let nbResultPerPage = 20;
        let totalPageCount = Math.floor((totalResultsCount + (nbResultPerPage - 1)) / nbResultPerPage);
        let items = [];
        items.push(
            <Pagination.Item key={currentPage} active={true} onClick={() => {this.onClickPage(currentPage)}}>{currentPage}</Pagination.Item>
        )
        for (let i = 1; i <= 3 || items.length === 4; i++) {
            // previous items
            if (currentPage - i > 0) {
                let pageItem = currentPage - i;
                items.unshift(
                    <Pagination.Item key={pageItem} onClick={() => {this.onClickPage(pageItem)}}>{pageItem}</Pagination.Item>
                )
            }
            // next items
            if (currentPage + i <= totalPageCount) {
                let pageItem = currentPage + i;
                items.push(
                    <Pagination.Item key={pageItem} onClick={() => {this.onClickPage(pageItem)}}>{pageItem}</Pagination.Item>
                )
            }
        }

        return (
            <>
                <Pagination>
                    <Pagination.First onClick={() => {this.onClickPage(1)}} />
                    <Pagination.Prev onClick={() => {this.onClickPage(currentPage - 1)}} />
                    {items}
                    <Pagination.Next onClick={() => {this.onClickPage(currentPage + 1)}} />
                    <Pagination.Last onClick={() => {this.onClickPage(totalPageCount)}} />
                </Pagination>
            </>
        );
    }
}