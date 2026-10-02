// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BrainrotMiner (PoB - Proof of Brainrot)
 * @dev Contrato para la hackathon. Minado basado en resistencia al brainrot.
 */
contract BrainrotMiner {
    string public constant name = "Six Seven Token";
    string public constant symbol = "67";
    uint8 public constant decimals = 18;
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public sessionStartTime;
    mapping(address => uint256) public aura;

    uint256 public constant SESSION_DURATION = 367; // 6 minutos 7 segundos
    uint256 public constant REWARD_AMOUNT = 67 * 10**18;
    uint256 public constant SLASH_PENALTY = 50;

    event SessionStarted(address indexed user, uint256 timestamp);
    event SessionSlashed(address indexed user, uint256 penalty);
    event RewardClaimed(address indexed user, uint256 amount);

    function startSession() external {
        require(sessionStartTime[msg.sender] == 0, "Sesion ya activa");
        sessionStartTime[msg.sender] = block.timestamp;
        
        if (aura[msg.sender] == 0) {
            aura[msg.sender] = 100; // Aura inicial
        }
        
        emit SessionStarted(msg.sender, block.timestamp);
    }

    function slash() external {
        require(sessionStartTime[msg.sender] != 0, "No hay sesion activa");
        
        // El usuario movio el celular. Pierde aura y no recibe recompensa.
        sessionStartTime[msg.sender] = 0;
        
        if (aura[msg.sender] > SLASH_PENALTY) {
            aura[msg.sender] -= SLASH_PENALTY;
        } else {
            aura[msg.sender] = 0;
        }
        
        emit SessionSlashed(msg.sender, SLASH_PENALTY);
    }

    function claim67(bytes memory accelerometerProof) external {
        require(sessionStartTime[msg.sender] != 0, "No hay sesion activa");
        require(block.timestamp >= sessionStartTime[msg.sender] + SESSION_DURATION, "Protocolo 6-7 no completado");
        
        // En un entorno de produccion, accelerometerProof seria verificado on-chain (ZKP o firma de un oraculo).
        // Para la demo, confiamos en la llamada del frontend si paso el tiempo.

        balances[msg.sender] += REWARD_AMOUNT;
        aura[msg.sender] += 10; // Gana aura
        sessionStartTime[msg.sender] = 0; // Reset
        
        emit RewardClaimed(msg.sender, REWARD_AMOUNT);
    }
}
