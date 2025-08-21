import { useState } from "react";
import { DollarSign, Plus, TrendingUp, TrendingDown, Calendar, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Expense {
  id: string;
  amount: number; // in cents
  currency: string;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  tags: string;
  isRecurring: boolean;
}

export function ExpensesWidget() {
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "food",
    description: "",
    paymentMethod: "card",
    tags: "",
    isRecurring: false,
    userId: "default-user",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const queryClient = useQueryClient();

  // Calculate date range based on active tab
  const getDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    switch (activeTab) {
      case "today":
        return {
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case "week":
        return {
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case "month":
        return {
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      default:
        return {};
    }
  };

  const dateRange = getDateRange();
  const queryParams = new URLSearchParams();
  if (dateRange.startDate) queryParams.set('startDate', dateRange.startDate);
  if (dateRange.endDate) queryParams.set('endDate', dateRange.endDate);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["/api/expenses", activeTab],
    queryFn: async () => {
      const response = await fetch(`/api/expenses?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch expenses");
      return response.json();
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expense: typeof newExpense & { date: string }) => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...expense,
          amount: Math.round(parseFloat(expense.amount) * 100), // Convert to cents
        }),
      });
      if (!response.ok) throw new Error("Failed to create expense");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setShowAddDialog(false);
      setNewExpense({
        amount: "",
        category: "food",
        description: "",
        paymentMethod: "card",
        tags: "",
        isRecurring: false,
        userId: "default-user",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete expense");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
  });

  const categories = [
    { value: "food", label: "🍽️ Food", color: "bg-orange-500/20 text-orange-300" },
    { value: "transport", label: "🚗 Transport", color: "bg-blue-500/20 text-blue-300" },
    { value: "health", label: "🏥 Health", color: "bg-red-500/20 text-red-300" },
    { value: "entertainment", label: "🎬 Entertainment", color: "bg-purple-500/20 text-purple-300" },
    { value: "shopping", label: "🛍️ Shopping", color: "bg-pink-500/20 text-pink-300" },
    { value: "bills", label: "📄 Bills", color: "bg-gray-500/20 text-gray-300" },
    { value: "education", label: "📚 Education", color: "bg-green-500/20 text-green-300" },
    { value: "other", label: "💰 Other", color: "bg-yellow-500/20 text-yellow-300" },
  ];

  const paymentMethods = [
    { value: "card", label: "💳 Card" },
    { value: "cash", label: "💵 Cash" },
    { value: "bank_transfer", label: "🏦 Bank Transfer" },
    { value: "digital_wallet", label: "📱 Digital Wallet" },
  ];

  const quickExpenses = [
    { description: "Coffee", amount: "4.50", category: "food" },
    { description: "Lunch", amount: "12.00", category: "food" },
    { description: "Uber ride", amount: "15.00", category: "transport" },
    { description: "Grocery shopping", amount: "65.00", category: "food" },
  ];

  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountInCents / 100);
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[categories.length - 1];
  };

  const totalAmount = expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

  const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense: Expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20">
        <div className="animate-pulse">
          <div className="h-6 bg-white bg-opacity-20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-4 bg-white bg-opacity-20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Expenses</h3>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {quickExpenses.map((quick, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewExpense({
                        ...newExpense,
                        description: quick.description,
                        amount: quick.amount,
                        category: quick.category,
                      });
                    }}
                    className="text-xs h-auto py-2 justify-start"
                  >
                    {quick.description} ${quick.amount}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />

              <Select
                value={newExpense.paymentMethod}
                onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Tags (optional)"
                value={newExpense.tags}
                onChange={(e) => setNewExpense({ ...newExpense, tags: e.target.value })}
              />

              <Button
                onClick={() => createExpenseMutation.mutate({
                  ...newExpense,
                  date: new Date().toISOString().split('T')[0],
                  userId: "default-user",
                })}
                disabled={!newExpense.amount || !newExpense.description || createExpenseMutation.isPending}
                className="w-full"
              >
                Add Expense
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white bg-opacity-20 rounded-lg p-1">
            <TabsTrigger value="today" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Today</TabsTrigger>
            <TabsTrigger value="week" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs text-white data-[state=active]:bg-zen-sage data-[state=active]:text-white">Month</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-3 mt-3">
            <div className="text-center p-2 bg-white/10 rounded-lg">
              <p className="text-lg font-bold text-white">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-xs text-white/60">
                Total {activeTab === "today" ? "today" : `this ${activeTab}`}
              </p>
            </div>

            {Object.keys(expensesByCategory).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-white/80">By Category:</p>
                {Object.entries(expensesByCategory)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([category, amount]) => {
                    const categoryInfo = getCategoryInfo(category);
                    const amountNumber = amount as number;
                    const percentage = Math.round((amountNumber / totalAmount) * 100);
                    return (
                      <div key={category} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Badge className={categoryInfo.color}>
                            {categoryInfo.label}
                          </Badge>
                        </span>
                        <span className="text-white/80">
                          {formatCurrency(amountNumber)} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {expenses.length === 0 ? (
                <p className="text-sm text-white/60 text-center py-4">
                  No expenses {activeTab === "today" ? "today" : `this ${activeTab}`} yet.
                </p>
              ) : (
                expenses.map((expense: Expense) => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {formatCurrency(expense.amount)}
                          </span>
                          <Badge className={`${categoryInfo.color} text-xs`}>
                            {categoryInfo.label.split(' ')[1]}
                          </Badge>
                          {expense.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/60 truncate">
                          {expense.description}
                        </p>
                        {expense.tags && (
                          <p className="text-xs text-white/40">
                            {expense.tags}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExpenseMutation.mutate(expense.id)}
                        className="h-6 w-6 p-0 text-white/60 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}