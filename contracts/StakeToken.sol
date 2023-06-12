// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakeToken is ERC20 {
    uint256 public constant MINIMUM_STAKE = 100_000;

    uint256 public constant REWARD_RATE = 10; // 10% reward rate per year
    uint256 public constant REWARD_DURATION = 365 days; // Duration for full reward

    address public owner;

    modifier isOwner() {
        require(
            msg.sender == owner,
            "You are not permitted to perfom this action"
        );
        _;
    }

    struct Stake {
        uint256 amount;
        uint256 startTime;
    }

    mapping(address => Stake) public stakes;

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply_
    ) ERC20(name, symbol) {
        owner = msg.sender;
        _mint(msg.sender, totalSupply_);
    }

    function _calculateAcumulatedReward(
        address staker
    ) private view returns (uint256) {
        Stake memory stakerInfo = stakes[staker];

        uint256 stakingDuration = block.timestamp - stakerInfo.startTime;
        uint256 reward = (stakerInfo.amount * REWARD_RATE * stakingDuration) /
            REWARD_DURATION /
            100;

        return reward;
    }

    function stake(uint256 amount) external {
        require(amount >= MINIMUM_STAKE, "Amount must be greater than 100");
        require(stakes[msg.sender].startTime == 0, "Already staked");

        // Transfer tokens from the sender to the contract
        transfer(address(this), amount);

        stakes[msg.sender] = Stake(amount, block.timestamp);
    }

    function mint(uint256 amount) external isOwner {
        _mint(msg.sender, amount);
    }

    function unstake() external {
        require(stakes[msg.sender].amount > 0, "No staked token");

        uint256 stakedAmount = stakes[msg.sender].amount;
        uint256 reward = _calculateAcumulatedReward(msg.sender);

        delete stakes[msg.sender];

        // Transfer staked amount + reward back to the sender
        _mint(msg.sender, stakedAmount + reward);

        _burn(address(this), stakedAmount);
    }

    function calculateReward(
        uint256 stakingAmount,
        uint256 stakingDuration
    ) external pure returns (uint256) {
        uint256 reward = (stakingAmount * REWARD_RATE * stakingDuration) /
            REWARD_DURATION /
            100;

        return reward;
    }
}
