import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';

@Injectable()
export class GetAdminDashboardUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // Fetch project progress
    const projects = await this.prisma.project.findMany({
      include: {
        tasks: {
          select: { status: true },
        },
      },
    });

    const projectProgress = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const doneTasks = p.tasks.filter((t) => t.status === 'DONE').length;
      const completionPercentage =
        totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

      return {
        id: p.id,
        name: p.name,
        totalTasks,
        doneTasks,
        completionPercentage,
      };
    });

    // Fetch top 3 performers
    // First, group tasks by assigneeId where status = DONE
    const doneTasksCount = await this.prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        status: 'DONE',
        assigneeId: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 3,
    });

    const topPerformers = await Promise.all(
      doneTasksCount.map(async (t) => {
        const user = await this.prisma.user.findUnique({
          where: { id: t.assigneeId! },
        });
        return {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          empId: user?.empId,
          doneCount: t._count.id,
        };
      }),
    );

    return {
      projectProgress,
      topPerformers,
    };
  }
}
