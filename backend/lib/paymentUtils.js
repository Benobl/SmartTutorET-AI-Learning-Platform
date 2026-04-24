import { v4 as uuidv4 } from "uuid";

export const generateTxRef = () => {
    return "tx-" + uuidv4();
};
