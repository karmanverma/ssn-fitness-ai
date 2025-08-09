import { createClient } from '@/lib/supabase/client'
import { Report } from '@/types/report'

export class SupabaseReports {
  private supabase = createClient()

  async saveReport(report: Omit<Report, 'id'> & { user_id: string }): Promise<Report | null> {
    try {
      const { data, error } = await this.supabase
        .from('reports')
        .insert([{
          user_id: report.user_id,
          title: report.title,
          content: report.content,
          category: report.category,
          tags: report.tags,
          status: report.status,
          metadata: report.metadata
        }])
        .select()
        .single()

      if (error) {
        console.error('Error saving report:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        status: data.status,
        metadata: data.metadata
      }
    } catch (error) {
      console.error('Error saving report:', error)
      return null
    }
  }

  async getReports(userId: string): Promise<Report[]> {
    try {
      const { data, error } = await this.supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reports:', error)
        return []
      }

      return data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        tags: item.tags,
        createdAt: new Date(item.created_at).getTime(),
        updatedAt: new Date(item.updated_at).getTime(),
        status: item.status,
        metadata: item.metadata
      }))
    } catch (error) {
      console.error('Error fetching reports:', error)
      return []
    }
  }

  async getReport(reportId: string, userId: string): Promise<Report | null> {
    try {
      const { data, error } = await this.supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching report:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        status: data.status,
        metadata: data.metadata
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      return null
    }
  }

  async updateReport(reportId: string, userId: string, updates: Partial<Report>): Promise<Report | null> {
    try {
      const { data, error } = await this.supabase
        .from('reports')
        .update({
          title: updates.title,
          content: updates.content,
          category: updates.category,
          tags: updates.tags,
          status: updates.status,
          metadata: updates.metadata
        })
        .eq('id', reportId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating report:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        status: data.status,
        metadata: data.metadata
      }
    } catch (error) {
      console.error('Error updating report:', error)
      return null
    }
  }

  async deleteReport(reportId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting report:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting report:', error)
      return false
    }
  }
}