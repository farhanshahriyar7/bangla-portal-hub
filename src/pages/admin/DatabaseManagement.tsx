import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, Download, Upload, Shield } from 'lucide-react';

const DatabaseManagement = () => {
  // Mock data - will be replaced with real data later
  const mockTables = [
    { name: 'profiles', records: 156, size: '2.4 MB', lastUpdated: '2 hours ago', rlsEnabled: true },
    { name: 'office_information', records: 142, size: '1.8 MB', lastUpdated: '5 hours ago', rlsEnabled: true },
    { name: 'user_roles', records: 8, size: '48 KB', lastUpdated: '1 day ago', rlsEnabled: true },
    { name: 'marital_information', records: 98, size: '512 KB', lastUpdated: '3 hours ago', rlsEnabled: true },
    { name: 'spouse_information', records: 87, size: '896 KB', lastUpdated: '3 hours ago', rlsEnabled: true },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">Monitor and manage database tables and records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTables.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active database tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTables.reduce((acc, table) => acc + table.records, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all tables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              RLS Protected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {mockTables.filter(t => t.rlsEnabled).length}/{mockTables.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Row-level security enabled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>Overview of all database tables and their statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Security</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTables.map((table) => (
                <TableRow key={table.name}>
                  <TableCell className="font-medium font-mono">{table.name}</TableCell>
                  <TableCell>{table.records.toLocaleString()}</TableCell>
                  <TableCell>{table.size}</TableCell>
                  <TableCell className="text-muted-foreground">{table.lastUpdated}</TableCell>
                  <TableCell>
                    {table.rlsEnabled ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        <Shield className="w-3 h-3 mr-1" />
                        RLS Enabled
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        RLS Disabled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Export</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Health</CardTitle>
            <CardDescription>Overall database performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Connection Status</span>
              <Badge className="bg-green-500/10 text-green-500">Healthy</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Query Time</span>
              <span className="text-sm text-muted-foreground">24ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Database Size</span>
              <span className="text-sm text-muted-foreground">5.7 MB</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest database operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">New record inserted</p>
                <p className="text-xs text-muted-foreground">profiles table • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Record updated</p>
                <p className="text-xs text-muted-foreground">office_information table • 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium">Backup completed</p>
                <p className="text-xs text-muted-foreground">All tables • 1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseManagement;
