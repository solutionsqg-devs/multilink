import { SetMetadata } from '@nestjs/common';
import { Plan } from '@prisma/client';

export const REQUIRED_PLAN_KEY = 'requiredPlan';
export const RequiredPlan = (plan: Plan) => SetMetadata(REQUIRED_PLAN_KEY, plan);
