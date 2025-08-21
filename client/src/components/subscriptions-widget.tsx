import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Plus, Edit, Trash2, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Subscription {
  id: string;
  userId: string;
  name: string;
  description: string;
  cost: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  isActive: boolean;
  url: string;
  notes: string;
  createdAt: string;
}

interface InsertSubscription {
  userId: string;
  name: string;
  description: string;
  cost: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  category: string;
  url: string;
  notes: string;
}

const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
];

const CATEGORIES = [
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "productivity", label: "Productivity", emoji: "💼" },
  { value: "health", label: "Health & Fitness", emoji: "🏥" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "software", label: "Software", emoji: "💻" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "music", label: "Music", emoji: "🎵" },
  { value: "other", label: "Other", emoji: "📦" },
];

export function SubscriptionsWidget() {
  const [showAddSubscription, setShowAddSubscription] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const queryClient = useQueryClient();

  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const createSubscription = useMutation({
    mutationFn: async (data: InsertSubscription) => {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setShowAddSubscription(false);
      setEditingSubscription(null);
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Subscription> & { id: string }) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setEditingSubscription(null);
    },
  });

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete subscription");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const subscriptionData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || "",
      cost: Math.round(parseFloat(formData.get("cost") as string) * 100), // Convert to cents
      currency: formData.get("currency") as string,
      billingCycle: formData.get("billingCycle") as string,
      nextBillingDate: formData.get("nextBillingDate") as string,
      category: formData.get("category") as string,
      url: formData.get("url") as string || "",
      notes: formData.get("notes") as string || "",
      userId: "default-user",
    };

    if (editingSubscription) {
      updateSubscription.mutate({ id: editingSubscription.id, ...subscriptionData });
    } else {
      createSubscription.mutate(subscriptionData);
    }
  };

  const formatCurrency = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getDaysUntilBilling = (nextBillingDate: string) => {
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateMonthlyTotal = () => {
    return subscriptions
      .filter(sub => sub.isActive)
      .reduce((total, sub) => {
        const monthlyCost = sub.billingCycle === 'yearly' 
          ? sub.cost / 12 
          : sub.billingCycle === 'weekly' 
          ? sub.cost * 4.33 
          : sub.billingCycle === 'quarterly'
          ? sub.cost / 3
          : sub.cost;
        return total + monthlyCost;
      }, 0);
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const monthlyTotal = calculateMonthlyTotal();

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white border-opacity-20 hover:translate-y-[-2px] transition-transform duration-300 h-full">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-white opacity-80" />
          <h3 className="text-white font-medium text-lg">Subscriptions</h3>
        </div>
        <Dialog open={showAddSubscription} onOpenChange={setShowAddSubscription}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-white hover:text-zen-sage transition-colors duration-300 p-2 h-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? "Edit Subscription" : "Add Subscription"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  name="name"
                  defaultValue={editingSubscription?.name}
                  placeholder="e.g., Netflix, Spotify"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  name="description"
                  defaultValue={editingSubscription?.description}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    name="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingSubscription ? (editingSubscription.cost / 100).toFixed(2) : ""}
                    placeholder="9.99"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue={editingSubscription?.currency || "USD"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select name="billingCycle" defaultValue={editingSubscription?.billingCycle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_CYCLES.map(cycle => (
                        <SelectItem key={cycle.value} value={cycle.value}>
                          {cycle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingSubscription?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.emoji} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="nextBillingDate">Next Billing Date</Label>
                <Input
                  name="nextBillingDate"
                  type="date"
                  defaultValue={editingSubscription?.nextBillingDate}
                  required
                />
              </div>
              <div>
                <Label htmlFor="url">Website URL (optional)</Label>
                <Input
                  name="url"
                  type="url"
                  defaultValue={editingSubscription?.url}
                  placeholder="https://service.com"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  name="notes"
                  defaultValue={editingSubscription?.notes}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
              <Button type="submit" disabled={createSubscription.isPending || updateSubscription.isPending}>
                {editingSubscription ? "Update" : "Add"} Subscription
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {/* Monthly total */}
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Total</span>
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(monthlyTotal, 'USD')}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Subscriptions list */}
        {activeSubscriptions.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No subscriptions tracked
          </p>
        ) : (
          <div className="space-y-3">
            {activeSubscriptions
              .sort((a, b) => getDaysUntilBilling(a.nextBillingDate) - getDaysUntilBilling(b.nextBillingDate))
              .slice(0, 4)
              .map(subscription => {
                const category = CATEGORIES.find(c => c.value === subscription.category);
                const daysUntilBilling = getDaysUntilBilling(subscription.nextBillingDate);
                
                return (
                  <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category?.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{subscription.name}</h4>
                          {subscription.url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0"
                              onClick={() => window.open(subscription.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{formatCurrency(subscription.cost, subscription.currency)}</span>
                          <span>•</span>
                          <span className="capitalize">{subscription.billingCycle}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {daysUntilBilling <= 7 && (
                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                          )}
                          <span className={daysUntilBilling <= 7 ? "text-orange-600" : "text-gray-500"}>
                            {daysUntilBilling === 0 
                              ? "Due today" 
                              : daysUntilBilling === 1 
                              ? "Due tomorrow"
                              : `Due in ${daysUntilBilling} days`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingSubscription(subscription);
                          setShowAddSubscription(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        onClick={() => deleteSubscription.mutate(subscription.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}