import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  
  const categoryValue = watch('category');

  const categories = [
    { label: 'North Indian', value: 'North Indian' },
    { label: 'South Indian', value: 'South Indian' },
    { label: 'Chinese', value: 'Chinese' },
    { label: 'Italian', value: 'Italian' },
    { label: 'Desserts', value: 'Desserts' },
    { label: 'Beverages', value: 'Beverages' },
  ];

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await api.get('/menu', { params: { limit: 100 } });
      setMenuItems(res.data);
    } catch (err) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    reset({
      name: '',
      description: '',
      price: '',
      category: 'North Indian',
      image: '',
      isVeg: true,
      isAvailable: true,
      isTodaySpecial: false,
      isFeatured: false,
      prepTime: 15,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    reset({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      isTodaySpecial: item.isTodaySpecial,
      isFeatured: item.isFeatured,
      prepTime: item.prepTime,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item deleted successfully!');
      fetchMenu();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, data);
        toast.success('Menu item updated successfully!');
      } else {
        await api.post('/menu', data);
        toast.success('Menu item created successfully!');
      }
      setModalOpen(false);
      fetchMenu();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter local state based on search query
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Image',
      field: 'image',
      render: (img, row) => (
        <img
          src={img}
          alt={row.name}
          className="w-12 h-12 object-cover rounded-lg bg-gray-100"
        />
      ),
    },
    { header: 'Name', field: 'name' },
    { header: 'Category', field: 'category' },
    {
      header: 'Price',
      field: 'price',
      render: (price) => `₹${price}`,
    },
    {
      header: 'Type',
      field: 'isVeg',
      render: (isVeg) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
          isVeg ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
        }`}>
          {isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      ),
    },
    {
      header: 'Status',
      field: 'isAvailable',
      render: (isAvailable) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
          isAvailable ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {isAvailable ? 'Available' : 'Sold Out'}
        </span>
      ),
    },
    {
      header: 'Actions',
      field: '_id',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-gray-600 dark:text-dark-300 transition-colors"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id || row.id)}
            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-danger-600 transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Menu Management</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">Add, edit, or delete items from the menu catalog</p>
        </div>
        <Button onClick={openAddModal} variant="primary" className="gap-1.5 shadow-md">
          <HiOutlinePlus className="w-5 h-5" /> Add Menu Item
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative max-w-xs w-full">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-dark-800 border-0 rounded-xl text-sm w-full"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredItems}
          loading={loading}
          emptyMessage="No menu items matched your search criteria."
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Dish Name"
            name="name"
            placeholder="E.g. Shahi Paneer"
            register={register}
            required
            error={errors.name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              name="price"
              type="number"
              placeholder="250"
              register={register}
              required
              error={errors.price?.message}
            />

            <Input
              label="Prep Time (mins)"
              name="prepTime"
              type="number"
              placeholder="15"
              register={register}
              required
              error={errors.prepTime?.message}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-200">Category</label>
            <Select
              options={categories}
              value={categoryValue}
              onChange={(val) => setValue('category', val)}
            />
          </div>

          <Input
            label="Image URL"
            name="image"
            placeholder="https://images.unsplash.com/..."
            register={register}
            required
            error={errors.image?.message}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-200">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Enter details about this dish..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm"
            />
            {errors.description && <p className="text-sm text-danger-500">{errors.description.message}</p>}
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-dark-800 p-4 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isVeg')} className="w-4 h-4 rounded text-primary-500" />
              <span className="text-sm text-dark-700 dark:text-dark-300">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isAvailable')} className="w-4 h-4 rounded text-primary-500" />
              <span className="text-sm text-dark-700 dark:text-dark-300">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isTodaySpecial')} className="w-4 h-4 rounded text-primary-500" />
              <span className="text-sm text-dark-700 dark:text-dark-300">Today's Special</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded text-primary-500" />
              <span className="text-sm text-dark-700 dark:text-dark-300">Featured</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-700">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitLoading}>
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AdminMenuManagement;
