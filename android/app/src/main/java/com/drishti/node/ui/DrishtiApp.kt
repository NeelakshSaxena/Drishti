package com.drishti.node.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.rememberNavController
import com.drishti.node.navigation.DrishtiNavGraph
import com.drishti.node.theme.DrishtiTheme

@Composable
fun DrishtiApp(viewModel: NodeViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val navController = rememberNavController()
    LaunchedEffect(Unit) { viewModel.restoreSession() }
    DrishtiTheme(darkTheme = state.darkMode) {
        DrishtiNavGraph(navController, state, viewModel)
    }
}
