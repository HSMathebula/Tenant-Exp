import type { Request, Response } from "express"
import InventoryItem from "../models/InventoryItem.model"

// Get all inventory items
export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    const inventoryItems = await InventoryItem.find()
    res.status(200).json(inventoryItems)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get inventory item by ID
export const getInventoryItemById = async (req: Request, res: Response) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id)

    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" })
    }

    res.status(200).json(inventoryItem)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Create new inventory item
export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const { name, category, description, quantity, unit, minQuantity, cost, supplier, location } = req.body

    // Check if item with same name already exists
    const existingItem = await InventoryItem.findOne({ name })
    if (existingItem) {
      return res.status(400).json({ message: "Item with this name already exists" })
    }

    const inventoryItem = new InventoryItem({
      name,
      category,
      description,
      quantity,
      unit,
      minQuantity,
      cost,
      supplier,
      location,
    })

    await inventoryItem.save()
    res.status(201).json({ message: "Inventory item created successfully", inventoryItem })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update inventory item
export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { name, category, description, quantity, unit, minQuantity, cost, supplier, location, image } = req.body

    const inventoryItem = await InventoryItem.findById(req.params.id)
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" })
    }

    // Update fields
    if (name) inventoryItem.name = name
    if (category) inventoryItem.category = category
    if (description !== undefined) inventoryItem.description = description
    if (quantity !== undefined) inventoryItem.quantity = quantity
    if (unit) inventoryItem.unit = unit
    if (minQuantity !== undefined) inventoryItem.minQuantity = minQuantity
    if (cost !== undefined) inventoryItem.cost = cost
    if (supplier !== undefined) inventoryItem.supplier = supplier
    if (location !== undefined) inventoryItem.location = location
    if (image) inventoryItem.image = image

    await inventoryItem.save()
    res.status(200).json({ message: "Inventory item updated successfully", inventoryItem })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Delete inventory item
export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const inventoryItem = await InventoryItem.findById(req.params.id)
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" })
    }

    await InventoryItem.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Inventory item deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get low stock inventory items
export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ["$quantity", "$minQuantity"] },
    })

    res.status(200).json(lowStockItems)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Update inventory quantity
export const updateInventoryQuantity = async (req: Request, res: Response) => {
  try {
    const { quantity, adjustment } = req.body

    const inventoryItem = await InventoryItem.findById(req.params.id)
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" })
    }

    if (quantity !== undefined) {
      inventoryItem.quantity = quantity
    } else if (adjustment) {
      inventoryItem.quantity = Math.max(0, inventoryItem.quantity + adjustment)
    }

    await inventoryItem.save()
    res.status(200).json({ message: "Inventory quantity updated successfully", inventoryItem })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
