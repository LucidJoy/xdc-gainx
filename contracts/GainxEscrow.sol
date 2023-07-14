// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./GainxInsurance.sol";
import "./GainxFuture.sol";
import "./GainxPool.sol";

contract GainxEscrow is
    GainxInsurance,
    GainxFuture,
    GainxPool,
    AutomationCompatibleInterface
{
    AggregatorV3Interface internal ethUsd;
    AggregatorV3Interface internal glmrUsd;
    AggregatorV3Interface internal linkUsd;
    AggregatorV3Interface internal dataFeed4;
    using Counters for Counters.Counter;

    // uint public immutable interval; every 1 month
    uint public lastTimeStamp;

    address immutable tnt20TokenAddress;

    constructor(address _tnt20TokenAddr) {
        tnt20TokenAddress = _tnt20TokenAddr;
        ethUsd = AggregatorV3Interface(
            0x0BAA6E884cfD628b33867F9E081B44a76276fA2D
        );
        // XDC(Glimmer -> Moonbeam token)
        glmrUsd = AggregatorV3Interface(
            0x537879A0beA294c1ce04161Ae827919e92C23e92
        );
        linkUsd = AggregatorV3Interface(
            0x5310f2d4B531BCEA8126e2aEE40BAd71B707f530
        );

        lastTimeStamp = block.timestamp;
    }

    Counters.Counter private _escrowIdCounter;
    uint count;

    uint256 redeemTenure = 24 * 60 * 2 * 7; // 1 week ---> 7 days in blocks @2/min

    function getETHtoUSD() public view returns (int) {
        // prettier-ignore
        // divide by 10^3
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = ethUsd.latestRoundData();
        return answer;
    }

    function getXDCtoUSD() public view returns (int) {
        // prettier-ignore
        // divide by 10^3
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = glmrUsd.latestRoundData();
        return answer;
    }

    function getLINKtoUSD() public view returns (int) {
        // prettier-ignore
        // divide by 10^18
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = linkUsd.latestRoundData();
        return answer;
    }

    function _initEscrow(
        address _borrower,
        int256 _amount,
        address _nftAddress,
        uint256 _nftId,
        uint256 _tenure,
        uint256 _apy
    ) public payable {
        // working
        uint256 _escrowId = _escrowIdCounter.current();

        uint256 _startBlock = block.number;
        // uint256 _endBlock = _startBlock + (_tenure * 2880);

        _lockFutureApy(_escrowId, _apy); // Future for APY

        int256 ethInUsd = getETHtoUSD();
        int256 glmrInUsd = getXDCtoUSD();
        int256 finalAmount = (_amount * ethInUsd) / glmrInUsd;

        Escrow memory newEscrow = Escrow(
            _escrowId,
            _startBlock,
            _nftAddress,
            _nftId,
            address(0),
            _borrower,
            finalAmount,
            _tenure,
            _apy,
            false,
            false,
            false
        );
        escrows.push(newEscrow);
        idToEscrow[_escrowId] = newEscrow;

        borrowersList[_borrower].push(newEscrow);

        LendingStates memory newLendingState = LendingStates(
            true,
            false,
            false,
            false,
            false
        );

        idToLendingStates[_escrowId] = newLendingState;

        _escrowIdCounter.increment();
    }

    function _withdrawNft(uint256 _escrowId) public payable {
        require(
            idToLendingStates[_escrowId].receivedFunds == false,
            "Cannot withdraw NFT now!!"
        );

        // send the NFT back to borrower
    }

    function _acceptOffer(uint256 _escrowId, bool _isInsuared) public payable {
        // working
        Escrow storage currEscrow = idToEscrow[_escrowId];

        if (_isInsuared) {
            buyInsurance(msg.sender, currEscrow.amount, _escrowId);
            currEscrow.isInsuared = true;
        }

        idToLendingStates[_escrowId].receivedFunds = true;
        currEscrow.accepted = true;
        currEscrow.lender = msg.sender;

        int256 _repayAmt = currEscrow.amount +
            ((int256(currEscrow.apy) * currEscrow.amount) / 100); // amount --> 10^18 format
        lenderToRepayAmt[msg.sender] = uint256(_repayAmt);
        lendersList[msg.sender].push(currEscrow);

        (bool sent, ) = currEscrow.borrower.call{
            value: uint256(currEscrow.amount)
        }("");
        require(sent, "Failed to send Ether");

        IERC20(tnt20TokenAddress).transfer(
            msg.sender,
            uint256(idToEscrow[_escrowId].amount)
        );
    }

    function _receiveRepayAmt(uint256 _escrowId) public payable {
        idToLendingStates[_escrowId].receivedRepayAmt = true;
        idToLendingStates[_escrowId].completed = true;
        idToEscrow[_escrowId].completed = true;

        // send the NFT back to borrower
    }

    function _receiveReedemAmt(uint256 _escrowId) public payable {
        // working
        idToLendingStates[_escrowId].receivedReedemTokens = true;

        (bool sent, ) = idToEscrow[_escrowId].lender.call{
            value: lenderToRepayAmt[idToEscrow[_escrowId].lender]
        }("");
        require(sent, "Failed to send TFil tokens");

        // send the TFil to the lender
    }

    function getExploreListings() public view returns (Escrow[] memory) {
        // working
        uint totalItemCount = escrows.length;
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToEscrow[i].accepted == false) {
                itemCount += 1;
            }
        }

        Escrow[] memory items = new Escrow[](itemCount);

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToEscrow[i].accepted == false) {
                uint currentId = i;

                Escrow storage currentItem = idToEscrow[currentId];

                items[currentIndex] = currentItem;

                currentIndex += 1;
            }
        }

        return items;
    }

    /*
    mapping(address => Escrow[]) public lendersList;
    mapping(address => Escrow[]) public borrowersList;
    */

    function getLendersList(
        address _lender
    ) public view returns (Escrow[] memory) {
        // working
        uint totalItemCount = lendersList[_lender].length;
        uint currentIndex = 0;

        Escrow[] memory items = new Escrow[](totalItemCount);

        for (uint i = 0; i < totalItemCount; i++) {
            uint256 tempId = lendersList[_lender][i].escrowId;

            Escrow storage currentItem = idToEscrow[tempId];

            items[currentIndex] = currentItem;

            currentIndex += 1;
        }

        return items;
    }

    function getBorrowersList(
        address _borrower
    ) public view returns (Escrow[] memory) {
        // working
        uint totalItemCount = borrowersList[_borrower].length;
        uint currentIndex = 0;

        Escrow[] memory items = new Escrow[](totalItemCount);

        for (uint i = 0; i < totalItemCount; i++) {
            uint currentId = borrowersList[_borrower][i].escrowId;

            Escrow storage currentItem = idToEscrow[currentId];

            items[currentIndex] = currentItem;

            currentIndex += 1;
        }

        return items;
    }

    function checkUpkeep(
        bytes calldata checkData
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 escrowId = abi.decode(checkData, (uint256));

        upkeepNeeded =
            (idToEscrow[escrowId].startBlock + idToEscrow[escrowId].tenure) >
            block.number;
        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
        bytes memory encodedData = abi.encode(escrowId);

        return (upkeepNeeded, encodedData);
    }

    function performUpkeep(bytes calldata performData) external override {
        // We highly recommend revalidating the upkeep in the performUpkeep function
        uint256 escrowId = abi.decode(performData, (uint256));

        if (
            (idToEscrow[escrowId].startBlock + idToEscrow[escrowId].tenure) >
            block.number
        ) {
            _receiveReedemAmt(escrowId);
        }

        // We don't use the performData in this example.
        // The performData is generated by the Automation Node's call to your checkUpkeep function
    }

    function getCount() external view returns (uint) {
        return count;
    }
}
