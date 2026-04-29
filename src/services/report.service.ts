import { Report } from '../models'

export async function getVisibleReports(userId: number, isAdmin: boolean) {
  if (isAdmin) {
    return Report.findAll()
  }
  return Report.findAll({ where: { userId } })
}
