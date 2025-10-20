import { useState, useEffect } from 'react';
import { Product } from '../types/product';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, '$id'>) => void;
  onCancel?: () => void;
}

export default function ProductForm({ onSubmit, product, onCancel }: ProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [inStock, setInStock] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description ?? '');
      setCategory(product.category ?? '');
      setInStock(product.inStock ?? true);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setCategory('');
      setInStock(true);
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      price: parseFloat(price),
      description,
      category,
      inStock,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded space-y-4">
      <input
        type="text"
        placeholder="Product Name"
        className="w-full p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        className="w-full p-2 border rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        className="w-full p-2 border rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={1000}
      />
      <input
        type="text"
        placeholder="Category"
        className="w-full p-2 border rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        maxLength={50}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
        />
        In Stock
      </label>

      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {product ? 'Update' : 'Create'}
        </button>
        {product && onCancel && (
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
