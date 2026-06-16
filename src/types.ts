export interface BalanceData {
  firstname: string;
  lastname: string;
  current_balance: number;
  amount: number;
  daily_spending_limit: number;
  meal_plan_name: string;
  subscriber_status: string;
}

export interface HistoryItem {
  name: string;
  cost: number;
  quantity: number;
  date: string;
  transaction_point: string;
}

export type Screen = 'home' | 'report' | 'settings';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}
