import { Frame } from "../../services/frame";
import { Lens } from "../../services/lens";


export interface ConfiguredProduct {
  id: string; // A unique ID for the combined product (e.g., frameId-lensId-power)
  frame: Frame;
  lens: Lens;
  power: number; // The lens power (e.g., -1.5, +2.0)
  quantity: number;
  totalPrice: number; // Calculated price of frame + lens * quantity
}
