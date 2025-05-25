// inventory.ts
import { gql } from '@apollo/client';

// Mutations

// Update inventory quantity
export const UPDATE_INVENTORY_QUANTITY = gql`
  mutation UpdateInventoryQuantity($quantity: Float!, $shopId: Float!, $itemId: Float!) {
    updateInventoryQuantity(quantity: $quantity, shopId: $shopId, itemId: $itemId)
  } 
`;
