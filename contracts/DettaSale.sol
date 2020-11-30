// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";



contract DettaSale is RefundableCrowdsale, Ownable{

    uint256 _cap;
    

    constructor(uint256 hardcap, uint256 softcap,uint256 rate, address payable wallet, IERC20 token,uint256 startTime, uint256 endTime) 
    Crowdsale(rate,wallet,token) 
    RefundableCrowdsale(softcap)
    TimedCrowdsale(startTime,endTime)
    public {

        require(rate>0,"Rate is zero");

        require(softcap > 0, "Softcap is 0");
        require(hardcap > softcap,"Soft cap smaller than hard cap.");
        _cap = hardcap;
    }

    function cap() public view returns (uint256) {
        return _cap;
    }

    /**
     * @dev Checks whether the cap has been reached.
     * @return Whether the cap was reached
     */
    function capReached() public view returns (bool) {
        return weiRaised() >= _cap;
    }

    /**
     * @dev Extend parent behavior requiring purchase to respect the funding cap.
     * @param beneficiary Token purchaser
     * @param weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(weiRaised().add(weiAmount) <= _cap, "CappedCrowdsale: cap exceeded");
    }

    function extendTime(uint256 newClosingTime) onlyOwner public {
        _extendTime(newClosingTime);

    }

    function finalize() public {
        super.finalize();
        IERC20 token = token();
        address payable wallet = wallet();
        uint256 balance = token.balanceOf(address(this));
        token.transfer(wallet,balance);

    }


}
