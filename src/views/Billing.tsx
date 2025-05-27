import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Billing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const currentPlan = {
    name: 'Professional',
    price: '$29',
    period: 'month',
    features: [
      'Unlimited transcriptions',
      'Advanced AI processing',
      'Priority support',
      'Export to multiple formats',
      'Team collaboration'
    ]
  };

  const usageStats = {
    transcriptionsThisMonth: 47,
    minutesProcessed: 1248,
    storageUsed: '2.3 GB',
    apiCalls: 156
  };

  const billingHistory = [
    { date: '2024-03-01', amount: '$29.00', status: 'Paid', invoice: 'INV-2024-003' },
    { date: '2024-02-01', amount: '$29.00', status: 'Paid', invoice: 'INV-2024-002' },
    { date: '2024-01-01', amount: '$29.00', status: 'Paid', invoice: 'INV-2024-001' },
  ];

  const goBack = () => {
    window.history.back();
  };

  const handleUpgrade = () => {
    console.log('Upgrade plan clicked');
  };

  const handleDowngrade = () => {
    console.log('Downgrade plan clicked');
  };

  const handleCancelSubscription = () => {
    console.log('Cancel subscription clicked');
  };

  const billingContent = (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ marginLeft: 0 }}>
      <h1
        className="mt-100000 font-heading font-normal text-black text-3xl sm:text-4xl md:text-[40px] leading-tight sm:leading-[1.1] text-center mb-10 sm:mb-20"
      >
        Your SuperPowers Await.
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Plan */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Current Plan</CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </div>
              <Badge variant="default" className="text-sm">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{currentPlan.price}</span>
                <span className="text-muted-foreground ml-1">/{currentPlan.period}</span>
                <span className="ml-2 text-lg font-medium">{currentPlan.name}</span>
              </div>
              
              <div className="grid gap-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpgrade} variant="default">
                  Upgrade Plan
                </Button>
                <Button onClick={handleDowngrade} variant="outline">
                  Change Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>Current billing cycle stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transcriptions</span>
                <span className="font-medium">{usageStats.transcriptionsThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Minutes Processed</span>
                <span className="font-medium">{usageStats.minutesProcessed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="font-medium">{usageStats.storageUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">API Calls</span>
                <span className="font-medium">{usageStats.apiCalls}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Your recent invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingHistory.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{item.invoice}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{item.amount}</span>
                      <Badge 
                        variant={item.status === 'Paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                  {index < billingHistory.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="col-span-full border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground">
                  Cancel your subscription and lose access to premium features
                </p>
              </div>
              <Button 
                onClick={handleCancelSubscription} 
                variant="destructive" 
                size="sm"
              >
                Cancel Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {!isDesktop && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-lg font-semibold">Billing</h1>
        </div>
      )}

      {/* Desktop Back Button */}
      {isDesktop && (
        <div className="pt-6 pb-4 px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={goBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}

      <div className="pb-8">
        {billingContent}
      </div>
    </div>
  );
};

export default Billing;