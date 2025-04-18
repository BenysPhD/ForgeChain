// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title OracleMock
 * @notice Simule un oracle en renvoyant une donnée numérique (ex. indicateur environnemental).
 */
contract OracleMock {
    int256 public latestAnswer;

    event LatestAnswerUpdated(int256 newAnswer);

    /**
     * @notice Met à jour la valeur de l'oracle.
     * @param _answer La nouvelle valeur à enregistrer.
     */
    function setLatestAnswer(int256 _answer) external {
        latestAnswer = _answer;
        emit LatestAnswerUpdated(_answer);
    }
    
    /**
     * @notice Simule la fonction latestRoundData d’un agrégateur Chainlink.
     * @return roundId Un identifiant de ronde (toujours 0)
     * @return answer La donnée actuelle (latestAnswer)
     * @return startedAt Timestamp de début (block.timestamp)
     * @return updatedAt Timestamp de mise à jour (block.timestamp)
     * @return answeredInRound Un identifiant (toujours 0)
     */
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (0, latestAnswer, block.timestamp, block.timestamp, 0);
    }
}
