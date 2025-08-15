/**
 * Custom error classes for transfer market operations
 */

export class TransferMarketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TransferNotFoundError extends TransferMarketError {
  constructor(transferId: string) {
    super(`Transfer with ID ${transferId} not found`);
  }
}

export class TransferNotAvailableError extends TransferMarketError {
  constructor(transferId: string) {
    super(`Transfer with ID ${transferId} is not available for offers`);
  }
}

export class PlayerNotFoundError extends TransferMarketError {
  constructor(playerId: number) {
    super(`Player with ID ${playerId} not found`);
  }
}

export class ClubNotFoundError extends TransferMarketError {
  constructor(clubId: number) {
    super(`Club with ID ${clubId} not found`);
  }
}

export class PlayerNotListedError extends TransferMarketError {
  constructor(playerId: number) {
    super(`Player with ID ${playerId} is not listed for transfer`);
  }
}

export class PlayerAlreadyListedError extends TransferMarketError {
  constructor(playerId: number) {
    super(`Player with ID ${playerId} is already listed for transfer`);
  }
}

export class UnauthorizedError extends TransferMarketError {
  constructor(message = 'Unauthorized access') {
    super(message);
  }
}

export class OfferNotFoundError extends TransferMarketError {
  constructor(offerId: number) {
    super(`Offer with ID ${offerId} not found`);
  }
}

export class InsufficientFundsError extends TransferMarketError {
  constructor(clubId: number, amount: number, balance: number) {
    super(`Club ${clubId} has insufficient funds (needed: ${amount}, available: ${balance})`);
  }
}

export class OfferTooLowError extends TransferMarketError {
  constructor(offerAmount: number, currentBestOffer: number) {
    super(`Offer amount ${offerAmount} is too low. Current best offer is ${currentBestOffer}`);
  }
}

export class TransferAlreadyCompletedError extends TransferMarketError {
  constructor(transferId: string) {
    super(`Transfer ${transferId} has already been completed`);
  }
}

export class InvalidOfferStatusError extends TransferMarketError {
  constructor(status: string) {
    super(`Invalid offer status: ${status}`);
  }
}
