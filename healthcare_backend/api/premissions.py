from rest_framework import permissions


class IsAdmin(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user

        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user

        return False


class IsCreatorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return hasattr(obj, 'created_by') and obj.created_by == request.user
