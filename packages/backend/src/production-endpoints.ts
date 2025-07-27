// ===== PRODUCT MANAGEMENT ENDPOINTS =====

// Get Products with Categorization (Requirement 2.2)
app.get('/api/products', (req, res) => {
  try {
    const { category, supplierId, search, minPrice, maxPrice } = req.query;

    let filteredProducts = products.filter(p => p.isAvailable);

    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (supplierId) {
      filteredProducts = filteredProducts.filter(p => p.supplierId === supplierId);
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.pricePerUnit >= parseFloat(minPrice as string));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.pricePerUnit <= parseFloat(maxPrice as string));
    }

    const productsWithSupplier = filteredProducts.map(product => {
      const supplier = users.find(u => u.id === product.supplierId);
      return {
        ...product,
        supplierName: supplier?.name || 'Unknown',
        supplierTrustScore: calculateTrustScore(product.supplierId, 'supplier'),
        supplierLocation: supplier ? `${supplier.city}, ${supplier.state}` : 'Unknown'
      };
    });

    res.json({
      success: true,
      data: productsWithSupplier,
      meta: {
        total: productsWithSupplier.length,
        categories: ['vegetables', 'grains', 'spices', 'dairy', 'oils', 'pulses']
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get products' }
    });
  }
});

// Add Product (Supplier Only) (Requirement 7.2)
app.post('/api/products', authenticateToken, (req: any, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only suppliers can add products' }
      });
    }

    const { name, description, category, unit, pricePerUnit, stockQuantity, minOrderQuantity, images } = req.body;

    if (!name || !category || !unit || !pricePerUnit || stockQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid product data' }
      });
    }

    const newProduct = {
      id: generateId(),
      supplierId: req.user.id,
      name,
      description,
      category,
      unit,
      pricePerUnit: parseFloat(pricePerUnit),
      stockQuantity: parseInt(stockQuantity),
      minOrderQuantity: parseInt(minOrderQuantity) || 1,
      isAvailable: true,
      images: images || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    products.push(newProduct);

    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to add product' }
    });
  }
});

// Update Product Stock (Requirement 7.3)
app.put('/api/products/:productId/stock', authenticateToken, (req: any, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only suppliers can update stock' }
      });
    }

    const { productId } = req.params;
    const { stockQuantity } = req.body;

    const product = products.find(p => p.id === productId && p.supplierId === req.user.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    product.stockQuantity = parseInt(stockQuantity);
    product.updatedAt = new Date();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update stock' }
    });
  }
});

// ===== SUPPLIER SELECTION & AUTO-MATCHING =====

// Get Suppliers with TrustScore (Requirement 3.1)
app.get('/api/suppliers', (req, res) => {
  try {
    const { region, category, userLat, userLng, maxDistance } = req.query;

    let availableSuppliers = users.filter(u => u.role === 'supplier' && u.isActive);

    // Filter by region if specified
    if (region) {
      availableSuppliers = availableSuppliers.filter(s =>
        s.city.toLowerCase().includes((region as string).toLowerCase()) ||
        s.state.toLowerCase().includes((region as string).toLowerCase())
      );
    }

    // Filter by category if specified
    if (category) {
      const suppliersWithCategory = products
        .filter(p => p.category === category && p.isAvailable)
        .map(p => p.supplierId);
      availableSuppliers = availableSuppliers.filter(s => suppliersWithCategory.includes(s.id));
    }

    const suppliersWithDetails = availableSuppliers.map(supplier => {
      const trustScore = calculateTrustScore(supplier.id, 'supplier');
      const supplierProducts = products.filter(p => p.supplierId === supplier.id && p.isAvailable);

      let distance = null;
      if (userLat && userLng) {
        distance = calculateDistance(
          parseFloat(userLat as string),
          parseFloat(userLng as string),
          supplier.latitude,
          supplier.longitude
        );
      }

      return {
        id: supplier.id,
        name: supplier.name,
        businessName: supplier.businessType,
        trustScore,
        location: `${supplier.city}, ${supplier.state}`,
        address: supplier.address,
        distance,
        categories: [...new Set(supplierProducts.map(p => p.category))],
        productCount: supplierProducts.length,
        avgPrice: supplierProducts.length > 0 ?
          supplierProducts.reduce((sum, p) => sum + p.pricePerUnit, 0) / supplierProducts.length : 0,
        deliveryTime: distance ? (distance < 10 ? '2-4 hours' : distance < 25 ? '4-6 hours' : '6-8 hours') : '4-6 hours'
      };
    });

    // Filter by distance if specified
    let filteredSuppliers = suppliersWithDetails;
    if (maxDistance && userLat && userLng) {
      filteredSuppliers = suppliersWithDetails.filter(s => s.distance && s.distance <= parseFloat(maxDistance as string));
    }

    // Sort by trust score and distance
    filteredSuppliers.sort((a, b) => {
      if (a.distance && b.distance) {
        return (b.trustScore * 0.7) + ((100 - a.distance) * 0.3) - ((a.trustScore * 0.7) + ((100 - b.distance) * 0.3));
      }
      return b.trustScore - a.trustScore;
    });

    res.json({
      success: true,
      data: filteredSuppliers
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get suppliers' }
    });
  }
});

// Auto-match Supplier (Requirement 3.2, 3.3)
app.post('/api/suppliers/auto-match', authenticateToken, (req: any, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only vendors can use auto-match' }
      });
    }

    const { category, excludeSupplierIds = [] } = req.body;
    const vendorLocation = { lat: req.user.latitude, lng: req.user.longitude };

    const bestSupplier = findBestSupplier(vendorLocation, category, excludeSupplierIds);

    if (!bestSupplier) {
      return res.status(404).json({
        success: false,
        error: { message: 'No suitable suppliers found' }
      });
    }

    res.json({
      success: true,
      data: {
        supplier: {
          id: bestSupplier.id,
          name: bestSupplier.name,
          businessName: bestSupplier.businessType,
          trustScore: bestSupplier.trustScore,
          distance: bestSupplier.distance,
          availableProducts: bestSupplier.availableProducts,
          matchScore: bestSupplier.score
        }
      }
    });
  } catch (error) {
    console.error('Auto-match error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Auto-match failed' }
    });
  }
});

// ===== ORDER MANAGEMENT =====

// Create Order (Requirement 2.3, 2.4)
app.post('/api/orders', authenticateToken, (req: any, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only vendors can place orders' }
      });
    }

    const { supplierId, items, orderType, deliveryAddress, notes, autoMatch } = req.body;

    let selectedSupplierId = supplierId;

    // Auto-match supplier if requested
    if (autoMatch && items.length > 0) {
      const firstItemCategory = products.find(p => p.id === items[0].productId)?.category;
      if (firstItemCategory) {
        const vendorLocation = { lat: req.user.latitude, lng: req.user.longitude };
        const matchedSupplier = findBestSupplier(vendorLocation, firstItemCategory);
        if (matchedSupplier) {
          selectedSupplierId = matchedSupplier.id;
        }
      }
    }

    if (!selectedSupplierId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Supplier not specified or auto-match failed' }
      });
    }

    // Validate supplier exists
    const supplier = users.find(u => u.id === selectedSupplierId && u.role === 'supplier');
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: { message: 'Supplier not found' }
      });
    }

    // Validate and calculate order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId && p.supplierId === selectedSupplierId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: { message: `Product ${item.productId} not found` }
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: { message: `Insufficient stock for ${product.name}` }
        });
      }

      if (item.quantity < product.minOrderQuantity) {
        return res.status(400).json({
          success: false,
          error: { message: `Minimum order quantity for ${product.name} is ${product.minOrderQuantity}` }
        });
      }

      const itemTotal = product.pricePerUnit * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        pricePerUnit: product.pricePerUnit,
        totalPrice: itemTotal
      });

      // Reserve stock
      product.stockQuantity -= item.quantity;
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const newOrder = {
      id: generateId(),
      orderNumber,
      vendorId: req.user.id,
      supplierId: selectedSupplierId,
      items: orderItems,
      orderType: orderType || 'one_time',
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address,
      notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    orders.push(newOrder);

    // Create notification for supplier
    createNotification(
      selectedSupplierId,
      'new_order',
      'New Order Received! 🛒',
      `${req.user.name} placed order #${orderNumber} worth ₹${totalAmount}`,
      {
        orderId: newOrder.id,
        vendorTrustScore: calculateTrustScore(req.user.id, 'vendor'),
        orderNumber
      }
    );

    // Create chat room for this order
    const chatRoom = {
      id: generateId(),
      orderId: newOrder.id,
      vendorId: req.user.id,
      supplierId: selectedSupplierId,
      isActive: true,
      createdAt: new Date()
    };
    chatRooms.push(chatRoom);

    res.status(201).json({
      success: true,
      data: {
        order: newOrder,
        chatRoomId: chatRoom.id
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create order' }
    });
  }
});

// Get Orders (Requirement 5.3)
app.get('/api/orders', authenticateToken, (req: any, res) => {
  try {
    const userOrders = orders.filter(o =>
      req.user.role === 'vendor' ? o.vendorId === req.user.id : o.supplierId === req.user.id
    );

    const ordersWithDetails = userOrders.map(order => {
      const counterpart = users.find(u =>
        u.id === (req.user.role === 'vendor' ? order.supplierId : order.vendorId)
      );

      return {
        ...order,
        counterpartName: counterpart?.name || 'Unknown',
        counterpartTrustScore: counterpart ? calculateTrustScore(counterpart.id, counterpart.role) : 0,
        canChat: true,
        chatRoomId: chatRooms.find(c => c.orderId === order.id)?.id
      };
    });

    res.json({
      success: true,
      data: ordersWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get orders' }
    });
  }
});

// Update Order Status (Requirement 5.1, 5.2)
app.put('/api/orders/:orderId/status', authenticateToken, (req: any, res) => {
  try {
    const { orderId } = req.params;
    const { status, estimatedDeliveryTime, notes } = req.body;

    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found' }
      });
    }

    // Check authorization
    if (req.user.role === 'supplier' && order.supplierId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized' }
      });
    }

    if (req.user.role === 'vendor' && order.vendorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized' }
      });
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['accepted', 'rejected'],
      'accepted': ['in_progress'],
      'in_progress': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'rejected': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot transition from ${order.status} to ${status}` }
      });
    }

    // Update order
    order.status = status;
    order.updatedAt = new Date();

    if (estimatedDeliveryTime) {
      order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    }

    if (notes) {
      order.notes = notes;
    }

    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    // Handle rejected orders - restore stock
    if (status === 'rejected') {
      order.items.forEach((item: any) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          product.stockQuantity += item.quantity;
        }
      });
    }

    // Create notification
    const counterpartId = req.user.role === 'vendor' ? order.supplierId : order.vendorId;
    const statusMessages: { [key: string]: string } = {
      'accepted': 'Order Accepted! ✅',
      'rejected': 'Order Rejected ❌',
      'in_progress': 'Order In Progress 🔄',
      'out_for_delivery': 'Out for Delivery 🚚',
      'delivered': 'Order Delivered! 📦'
    };

    createNotification(
      counterpartId,
      'order_status_update',
      statusMessages[status] || 'Order Status Updated',
      `Order #${order.orderNumber} status updated to ${status}`,
      { orderId: order.id, status }
    );

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update order status' }
    });
  }
});

// ===== DIGITAL CONTRACT SYSTEM =====

// Create Digital Contract (Requirement 4.2)
app.post('/api/contracts', authenticateToken, (req: any, res) => {
  try {
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only suppliers can create contracts' }
      });
    }

    const { orderId, deliveryTimeline, paymentDeadline, qualityStandards, cancellationPolicy } = req.body;

    const order = orders.find(o => o.id === orderId && o.supplierId === req.user.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found' }
      });
    }

    const vendor = users.find(u => u.id === order.vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor not found' }
      });
    }

    const contractNumber = generateContractNumber();
    const contract = {
      id: generateId(),
      contractNumber,
      orderId,
      vendorId: order.vendorId,
      supplierId: req.user.id,
      terms: {
        deliveryTimeline: deliveryTimeline || '2-3 business days',
        quantities: order.items,
        totalCost: order.totalAmount,
        paymentDeadline: paymentDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        qualityStandards: qualityStandards || 'Fresh, high-quality products as per industry standards',
        cancellationPolicy: cancellationPolicy || 'Orders can be cancelled within 2 hours of placement'
      },
      status: 'pending_vendor_signature',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    contracts.push(contract);

    // Create notification for vendor
    createNotification(
      order.vendorId,
      'contract_received',
      'Digital Contract Ready! 📋',
      `Contract #${contractNumber} is ready for your signature`,
      { contractId: contract.id, orderId }
    );

    res.status(201).json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('Create contract error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create contract' }
    });
  }
});

// Sign Digital Contract (Requirement 4.3, 4.4)
app.post('/api/contracts/:contractId/sign', authenticateToken, (req: any, res) => {
  try {
    const { contractId } = req.params;
    const { signature } = req.body;

    const contract = contracts.find(c =>
      c.id === contractId && (c.vendorId === req.user.id || c.supplierId === req.user.id)
    );

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: { message: 'Contract not found' }
      });
    }

    const signatureData = {
      signedAt: new Date(),
      ipAddress: req.ip || 'unknown',
      deviceInfo: req.headers['user-agent'] || 'unknown'
    };

    if (req.user.role === 'vendor' && contract.vendorId === req.user.id) {
      contract.vendorSignature = signatureData;
      if (contract.status === 'pending_vendor_signature') {
        contract.status = contract.supplierSignature ? 'signed' : 'pending_supplier_signature';
      }
    } else if (req.user.role === 'supplier' && contract.supplierId === req.user.id) {
      contract.supplierSignature = signatureData;
      if (contract.status === 'pending_supplier_signature') {
        contract.status = contract.vendorSignature ? 'signed' : 'pending_vendor_signature';
      }
    } else {
      return res.status(403).json({
        success: false,
        error: { message: 'Unauthorized to sign this contract' }
      });
    }

    contract.updatedAt = new Date();

    // If both parties signed, create payment record and update order
    if (contract.status === 'signed') {
      const order = orders.find(o => o.id === contract.orderId);
      if (order) {
        order.status = 'accepted';

        // Create payment record
        const payment = {
          id: generateId(),
          orderId: contract.orderId,
          vendorId: contract.vendorId,
          supplierId: contract.supplierId,
          amount: contract.terms.totalCost,
          paymentMethod: 'pending',
          paymentStatus: 'pending',
          dueDate: contract.terms.paymentDeadline,
          createdAt: new Date()
        };
        payments.push(payment);
      }

      // Notify both parties
      createNotification(
        contract.vendorId,
        'contract_signed',
        'Contract Fully Executed! ✅',
        `Contract #${contract.contractNumber} has been signed by both parties`,
        { contractId: contract.id }
      );

      createNotification(
        contract.supplierId,
        'contract_signed',
        'Contract Fully Executed! ✅',
        `Contract #${contract.contractNumber} has been signed by both parties`,
        { contractId: contract.id }
      );
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to sign contract' }
    });
  }
});

// Get Contracts (Requirement 4.1)
app.get('/api/contracts', authenticateToken, (req: any, res) => {
  try {
    const userContracts = contracts.filter(c =>
      c.vendorId === req.user.id || c.supplierId === req.user.id
    );

    const contractsWithDetails = userContracts.map(contract => {
      const order = orders.find(o => o.id === contract.orderId);
      const counterpart = users.find(u =>
        u.id === (req.user.role === 'vendor' ? contract.supplierId : contract.vendorId)
      );

      return {
        ...contract,
        orderNumber: order?.orderNumber || 'Unknown',
        counterpartName: counterpart?.name || 'Unknown',
        canSign: (
          (req.user.role === 'vendor' && !contract.vendorSignature) ||
          (req.user.role === 'supplier' && !contract.supplierSignature)
        ) && contract.status !== 'signed'
      };
    });

    res.json({
      success: true,
      data: contractsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get contracts' }
    });
  }
});

// Continue with remaining endpoints...
// [This is part 2 - I'll continue with payment, chat, recurring orders, etc.]