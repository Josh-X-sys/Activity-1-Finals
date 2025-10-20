import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <h2 className="text-lg font-bold">{product.name}</h2>
      <p className="text-gray-700">Price: ${product.price}</p>
      {product.description && <p className="text-gray-600">{product.description}</p>}
      {product.category && <p className="text-sm text-gray-500">Category: {product.category}</p>}
      <p className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
        {product.inStock ? 'In Stock' : 'Out of Stock'}
      </p>
      <div className="flex gap-2 pt-2">
        <button onClick={onEdit} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
          Edit
        </button>
        <button onClick={onDelete} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  );
}
